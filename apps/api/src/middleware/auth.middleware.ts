import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { createLogger } from '../services/logger.service';
import { JWTPayload } from '@stack/shared-types';

// Extend FastifyRequest to include user information
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
    correlationId?: string;
  }
}

export interface AuthMiddlewareOptions {
  required?: boolean;
  requireKYC?: boolean;
}

/**
 * Authentication middleware for Fastify
 */
export const authMiddleware = (options: AuthMiddlewareOptions = {}) => {
  const { required = true, requireKYC = false } = options;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const logger = createLogger({
      correlationId: request.correlationId,
      service: 'AuthMiddleware',
    });

    try {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;
      
      if (!authHeader) {
        if (!required) {
          return; // Skip authentication if not required
        }

        logger.warn('Missing Authorization header', {
          path: request.url,
          method: request.method,
        });

        return reply.status(401).send({
          success: false,
          error: 'Authorization header is required',
          code: 'MISSING_AUTH_HEADER',
        });
      }

      // Check Bearer token format
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        logger.warn('Invalid Authorization header format', {
          path: request.url,
          method: request.method,
        });

        return reply.status(401).send({
          success: false,
          error: 'Invalid authorization header format. Use: Bearer <token>',
          code: 'INVALID_AUTH_FORMAT',
        });
      }

      const token = parts[1];
      if (!token) {
        logger.warn('Empty token in Authorization header', {
          path: request.url,
          method: request.method,
        });

        return reply.status(401).send({
          success: false,
          error: 'Token is required',
          code: 'MISSING_TOKEN',
        });
      }

      // Verify token
      const authService = new AuthService(request.correlationId);
      const payload = await authService.verifyJWT(token);

      // Check KYC requirement if specified
      if (requireKYC && payload.kycStatus !== 'PASSED') {
        logger.warn('KYC required but user has not completed KYC', {
          userId: payload.userId,
          kycStatus: payload.kycStatus,
          path: request.url,
        });

        return reply.status(403).send({
          success: false,
          error: 'KYC verification required to access this resource',
          code: 'KYC_REQUIRED',
          details: {
            kycStatus: payload.kycStatus,
          },
        });
      }

      // Attach user to request
      request.user = payload;

      logger.debug('Authentication successful', {
        userId: payload.userId,
        kycStatus: payload.kycStatus,
        path: request.url,
      });
    } catch (error) {
      logger.error('Authentication failed', error, {
        path: request.url,
        method: request.method,
      });

      // Handle different types of auth errors
      if (error.name === 'AuthServiceError') {
        return reply.status(error.statusCode || 401).send({
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      // Generic authentication error
      return reply.status(401).send({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_FAILED',
      });
    }
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuthMiddleware = authMiddleware({ required: false });

/**
 * Authentication middleware that requires KYC completion
 */
export const kycAuthMiddleware = authMiddleware({ required: true, requireKYC: true });

/**
 * Utility function to get user from request safely
 */
export const getAuthenticatedUser = (request: FastifyRequest): JWTPayload => {
  if (!request.user) {
    throw new Error('User not authenticated. Ensure auth middleware is applied.');
  }
  return request.user;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (request: FastifyRequest): boolean => {
  return !!request.user;
};

/**
 * Check if authenticated user has completed KYC
 */
export const hasCompletedKYC = (request: FastifyRequest): boolean => {
  return request.user?.kycStatus === 'PASSED';
};