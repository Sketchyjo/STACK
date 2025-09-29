import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@stack/database';
import { KYCStatus } from '@prisma/client';
import { config } from '../config';
import { ContextualLogger, createLogger } from './logger.service';
import { JWTPayload } from '@stack/shared-types';
import { AuditService } from './audit.service';

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

export interface CreateUserData {
  emailOrPhone: string;
  displayName?: string;
  referralCode?: string;
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: {
    id: string;
    email?: string;
    displayName: string;
    kycStatus: KYCStatus;
  };
}

export class AuthService {
  private logger: ContextualLogger;
  private auditService: AuditService;

  constructor(correlationId?: string) {
    this.logger = createLogger({
      correlationId,
      service: 'AuthService',
    });
    this.auditService = new AuditService(correlationId);
  }

  /**
   * Create or find user and generate JWT token for onboarding
   */
  async createOrFindUserAndGenerateToken(data: CreateUserData): Promise<AuthToken> {
    const { emailOrPhone, displayName, referralCode, correlationId, ipAddress, userAgent } = data;

    this.logger.info('Creating or finding user for onboarding', { 
      emailOrPhone, 
      hasReferral: !!referralCode 
    });

    try {
      // Determine if input is email or phone
      const isEmail = this.isValidEmail(emailOrPhone);
      
      // Try to find existing user
      const existingUser = await prisma.user.findFirst({
        where: isEmail 
          ? { email: emailOrPhone }
          : { phoneNumber: emailOrPhone },
      });

      let user;

      if (existingUser) {
        this.logger.info('Found existing user', { 
          userId: existingUser.id, 
          kycStatus: existingUser.kycStatus 
        });
        user = existingUser;
      } else {
        // Create new user
        this.logger.info('Creating new user', { emailOrPhone, isEmail });

        user = await prisma.user.create({
          data: {
            email: isEmail ? emailOrPhone : null,
            phoneNumber: !isEmail ? emailOrPhone : null,
            displayName: displayName || (isEmail ? emailOrPhone.split('@')[0] : 'User'),
            kycStatus: KYCStatus.PENDING,
            referralCode: this.generateReferralCode(),
            referredBy: referralCode,
          },
        });

        // Log user creation
        await this.auditService.logOnboardingStart({
          userId: user.id,
          emailOrPhone,
          referralCode,
          correlationId,
          ipAddress,
          userAgent,
        });

        this.logger.info('New user created', { 
          userId: user.id, 
          referralCode: user.referralCode 
        });
      }

      // Generate JWT token
      const token = await this.generateJWT(user);

      return token;
    } catch (error) {
      this.logger.error('Failed to create or find user', error, { emailOrPhone });

      // Log failed authentication attempt
      await this.auditService.logAuthentication({
        action: 'LOGIN_FAILURE',
        email: this.isValidEmail(emailOrPhone) ? emailOrPhone : undefined,
        errorMessage: error.message,
        correlationId,
        ipAddress,
        userAgent,
      });

      throw error;
    }
  }

  /**
   * Generate JWT token for user
   */
  async generateJWT(user: any): Promise<AuthToken> {
    try {
      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        kycStatus: user.kycStatus,
      };

      const token = jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN,
        issuer: 'stack-api',
        audience: 'stack-app',
      });

      // Calculate expiration date
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      const expiresAt = new Date(decoded.exp! * 1000);

      this.logger.info('JWT token generated', { 
        userId: user.id, 
        expiresAt: expiresAt.toISOString() 
      });

      return {
        token,
        expiresAt,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          kycStatus: user.kycStatus,
        },
      };
    } catch (error) {
      this.logger.error('Failed to generate JWT token', error, { userId: user?.id });
      throw new AuthServiceError('Token generation failed', 'TOKEN_GENERATION_FAILED', 500);
    }
  }

  /**
   * Verify and decode JWT token
   */
  async verifyJWT(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET, {
        issuer: 'stack-api',
        audience: 'stack-app',
      }) as JWTPayload;

      // Validate that the user still exists and token is valid
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          kycStatus: true,
        },
      });

      if (!user) {
        throw new AuthServiceError('User not found', 'USER_NOT_FOUND', 401);
      }

      // Update payload with current user state (in case KYC status changed)
      const updatedPayload: JWTPayload = {
        ...decoded,
        kycStatus: user.kycStatus,
      };

      return updatedPayload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        this.logger.warn('Invalid JWT token', { error: error.message });
        throw new AuthServiceError('Invalid token', 'INVALID_TOKEN', 401);
      }

      if (error instanceof jwt.TokenExpiredError) {
        this.logger.warn('Expired JWT token', { expiredAt: error.expiredAt });
        throw new AuthServiceError('Token expired', 'TOKEN_EXPIRED', 401);
      }

      if (error instanceof AuthServiceError) {
        throw error;
      }

      this.logger.error('JWT verification failed', error);
      throw new AuthServiceError('Token verification failed', 'TOKEN_VERIFICATION_FAILED', 401);
    }
  }

  /**
   * Update user KYC status
   */
  async updateKYCStatus(
    userId: string, 
    status: KYCStatus, 
    details?: Record<string, any>,
    correlationId?: string
  ): Promise<void> {
    try {
      this.logger.info('Updating KYC status', { userId, status });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, kycStatus: true },
      });

      if (!user) {
        throw new AuthServiceError('User not found', 'USER_NOT_FOUND', 404);
      }

      const oldStatus = user.kycStatus;

      // Update user KYC status
      await prisma.user.update({
        where: { id: userId },
        data: {
          kycStatus: status,
          kycCompletedAt: status === KYCStatus.PASSED ? new Date() : null,
        },
      });

      // Log KYC status update
      await this.auditService.logKYCUpdate({
        userId,
        oldStatus,
        newStatus: status,
        correlationId,
        details,
      });

      this.logger.info('KYC status updated successfully', { 
        userId, 
        oldStatus, 
        newStatus: status 
      });
    } catch (error) {
      this.logger.error('Failed to update KYC status', error, { userId, status });
      throw error;
    }
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      this.logger.error('Password hashing failed', error);
      throw new AuthServiceError('Password hashing failed', 'HASH_FAILED', 500);
    }
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      this.logger.error('Password verification failed', error);
      throw new AuthServiceError('Password verification failed', 'VERIFY_FAILED', 500);
    }
  }

  /**
   * Generate unique referral code
   */
  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Extract IP address from request
   */
  static getIPAddress(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Extract User-Agent from request
   */
  static getUserAgent(request: any): string {
    return request.headers['user-agent'] || 'unknown';
  }

  /**
   * Validate referral code exists
   */
  async validateReferralCode(code: string): Promise<boolean> {
    if (!code) return true; // Referral is optional

    try {
      const user = await prisma.user.findUnique({
        where: { referralCode: code },
        select: { id: true },
      });

      return !!user;
    } catch (error) {
      this.logger.error('Failed to validate referral code', error, { code });
      return false;
    }
  }

  /**
   * Generate password reset token (for future implementation)
   */
  async generatePasswordResetToken(userId: string): Promise<string> {
    // This would typically generate a secure token and store it with expiration
    // For now, just return a placeholder
    return 'password-reset-token-placeholder';
  }

  /**
   * Clean up expired tokens (for background job)
   */
  async cleanupExpiredTokens(): Promise<void> {
    // This would clean up any stored tokens or sessions that have expired
    // Implementation depends on token storage strategy
    this.logger.info('Token cleanup completed');
  }
}