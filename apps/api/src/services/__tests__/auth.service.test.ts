import { AuthService } from '../auth.service';
import { KYCStatus } from '@prisma/client';
import { mockPrisma } from '../../__tests__/setup';
import jwt from 'jsonwebtoken';

// Mock JWT
jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let authService: AuthService;
  const correlationId = 'test-correlation-id';

  beforeEach(() => {
    authService = new AuthService(correlationId);
    jest.clearAllMocks();
  });

  describe('createOrFindUserAndGenerateToken', () => {
    const mockUserData = {
      emailOrPhone: 'test@example.com',
      displayName: 'Test User',
      referralCode: 'REF123',
      correlationId,
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    };

    it('should create new user if not found', async () => {
      // Arrange
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);
      
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        displayName: 'Test User',
        kycStatus: KYCStatus.PENDING,
        referralCode: 'ABC12345',
      };
      mockPrisma.user.create.mockResolvedValueOnce(mockUser);

      const mockToken = 'mock.jwt.token';
      mockJwt.sign.mockReturnValueOnce(mockToken);
      mockJwt.decode.mockReturnValueOnce({ exp: Date.now() / 1000 + 3600 });

      // Act
      const result = await authService.createOrFindUserAndGenerateToken(mockUserData);

      // Assert
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          phoneNumber: null,
          displayName: 'Test User',
          kycStatus: KYCStatus.PENDING,
          referralCode: expect.any(String),
          referredBy: 'REF123',
        },
      });
      expect(result.token).toBe(mockToken);
      expect(result.user.id).toBe('user_123');
    });

    it('should return existing user if found', async () => {
      // Arrange
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        displayName: 'Test User',
        kycStatus: KYCStatus.PASSED,
      };
      mockPrisma.user.findFirst.mockResolvedValueOnce(mockUser);

      const mockToken = 'mock.jwt.token';
      mockJwt.sign.mockReturnValueOnce(mockToken);
      mockJwt.decode.mockReturnValueOnce({ exp: Date.now() / 1000 + 3600 });

      // Act
      const result = await authService.createOrFindUserAndGenerateToken(mockUserData);

      // Assert
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(result.token).toBe(mockToken);
      expect(result.user.id).toBe('user_123');
    });

    it('should handle phone number input', async () => {
      // Arrange
      const phoneData = { ...mockUserData, emailOrPhone: '+1234567890' };
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);
      
      const mockUser = {
        id: 'user_123',
        phoneNumber: '+1234567890',
        displayName: 'Test User',
        kycStatus: KYCStatus.PENDING,
      };
      mockPrisma.user.create.mockResolvedValueOnce(mockUser);

      mockJwt.sign.mockReturnValueOnce('mock.jwt.token');
      mockJwt.decode.mockReturnValueOnce({ exp: Date.now() / 1000 + 3600 });

      // Act
      await authService.createOrFindUserAndGenerateToken(phoneData);

      // Assert
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { phoneNumber: '+1234567890' },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: null,
          phoneNumber: '+1234567890',
          displayName: 'Test User',
          kycStatus: KYCStatus.PENDING,
          referralCode: expect.any(String),
          referredBy: 'REF123',
        },
      });
    });
  });

  describe('verifyJWT', () => {
    const mockToken = 'valid.jwt.token';

    it('should successfully verify valid token', async () => {
      // Arrange
      const mockPayload = {
        userId: 'user_123',
        email: 'test@example.com',
        kycStatus: 'PENDING',
        iat: 1234567890,
        exp: 1234567890,
      };
      mockJwt.verify.mockReturnValueOnce(mockPayload as any);

      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        kycStatus: KYCStatus.PENDING,
      };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

      // Act
      const result = await authService.verifyJWT(mockToken);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith(
        mockToken,
        expect.any(String),
        { issuer: 'stack-api', audience: 'stack-app' }
      );
      expect(result.userId).toBe('user_123');
      expect(result.kycStatus).toBe('PENDING');
    });

    it('should throw error for invalid token', async () => {
      // Arrange
      mockJwt.verify.mockImplementationOnce(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      // Act & Assert
      await expect(authService.verifyJWT('invalid.token')).rejects.toThrow('Invalid token');
    });

    it('should throw error for expired token', async () => {
      // Arrange
      mockJwt.verify.mockImplementationOnce(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      // Act & Assert
      await expect(authService.verifyJWT('expired.token')).rejects.toThrow('Token expired');
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const mockPayload = {
        userId: 'nonexistent_user',
        email: 'test@example.com',
        kycStatus: 'PENDING',
      };
      mockJwt.verify.mockReturnValueOnce(mockPayload as any);
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(authService.verifyJWT(mockToken)).rejects.toThrow('User not found');
    });
  });

  describe('updateKYCStatus', () => {
    const userId = 'user_123';

    it('should successfully update KYC status', async () => {
      // Arrange
      const mockUser = {
        id: userId,
        kycStatus: KYCStatus.PENDING,
      };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrisma.user.update.mockResolvedValueOnce({ ...mockUser, kycStatus: KYCStatus.PASSED });

      // Act
      await authService.updateKYCStatus(userId, KYCStatus.PASSED, { providerId: 'provider_123' });

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          kycStatus: KYCStatus.PASSED,
          kycCompletedAt: expect.any(Date),
        },
      });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        authService.updateKYCStatus(userId, KYCStatus.PASSED)
      ).rejects.toThrow('User not found');
    });
  });

  describe('validateReferralCode', () => {
    it('should return true for valid referral code', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'user_123' });

      // Act
      const result = await authService.validateReferralCode('VALID123');

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { referralCode: 'VALID123' },
        select: { id: true },
      });
    });

    it('should return false for invalid referral code', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      // Act
      const result = await authService.validateReferralCode('INVALID');

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for empty referral code', async () => {
      // Act
      const result = await authService.validateReferralCode('');

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });
  });
});