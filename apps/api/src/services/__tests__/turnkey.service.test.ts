import { TurnkeyService, TurnkeyServiceError } from '../turnkey.service';
import { TurnkeyClient } from '@turnkey/http';

// Mock the TurnkeyClient
jest.mock('@turnkey/http');
const MockTurnkeyClient = TurnkeyClient as jest.MockedClass<typeof TurnkeyClient>;

describe('TurnkeyService', () => {
  let turnkeyService: TurnkeyService;
  let mockClient: jest.Mocked<TurnkeyClient>;
  const correlationId = 'test-correlation-id';

  beforeEach(() => {
    // Create a mock client instance
    mockClient = {
      createWallet: jest.fn(),
      createWalletAccounts: jest.fn(),
      getOrganization: jest.fn(),
    } as any;

    // Mock the TurnkeyClient constructor to return our mock
    MockTurnkeyClient.mockImplementation(() => mockClient);

    turnkeyService = new TurnkeyService(correlationId);
    jest.clearAllMocks();
  });

  describe('getOrCreateWallet', () => {
    const userId = 'user_123';

    it('should create new wallet if none exists', async () => {
      // Arrange
      const mockWalletResponse = {
        activity: {
          result: {
            createWalletResult: {
              walletId: 'wallet_123',
            },
          },
        },
      };
      mockClient.createWallet.mockResolvedValueOnce(mockWalletResponse);

      // Act
      const result = await turnkeyService.getOrCreateWallet(userId);

      // Assert
      expect(result).toEqual({
        walletId: 'wallet_123',
        walletName: `stack-user-${userId}`,
      });
      expect(mockClient.createWallet).toHaveBeenCalledWith({
        type: 'ACTIVITY_TYPE_CREATE_WALLET',
        timestampMs: expect.any(String),
        organizationId: expect.any(String),
        parameters: {
          walletName: `stack-user-${userId}`,
          accounts: [],
        },
      });
    });

    it('should throw error if wallet creation fails', async () => {
      // Arrange
      const error = new Error('Turnkey API error');
      mockClient.createWallet.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(turnkeyService.getOrCreateWallet(userId)).rejects.toThrow(TurnkeyServiceError);
    });

    it('should throw error if no wallet ID returned', async () => {
      // Arrange
      const mockWalletResponse = {
        activity: {
          result: {
            createWalletResult: {},
          },
        },
      };
      mockClient.createWallet.mockResolvedValueOnce(mockWalletResponse);

      // Act & Assert
      await expect(turnkeyService.getOrCreateWallet(userId)).rejects.toThrow(
        'No wallet ID returned from Turnkey'
      );
    });
  });

  describe('createWalletAccounts', () => {
    const walletId = 'wallet_123';
    const userId = 'user_123';
    const chains = ['aptos', 'solana', 'evm'] as const;

    it('should create accounts for all specified chains', async () => {
      // Arrange
      const mockAccountResponse = {
        activity: {
          result: {
            createWalletAccountsResult: {
              addresses: [
                {
                  accountId: 'account_123',
                  address: '0x123abc',
                },
              ],
            },
          },
        },
      };
      
      // Mock successful responses for all chains
      mockClient.createWalletAccounts.mockResolvedValue(mockAccountResponse);

      // Act
      const result = await turnkeyService.createWalletAccounts(walletId, chains, userId);

      // Assert
      expect(Object.keys(result)).toHaveLength(3);
      expect(result.aptos).toEqual({
        accountId: 'account_123',
        address: '0x123abc',
        addressType: 'ADDRESS_TYPE_APTOS',
        walletId: 'wallet_123',
      });
      expect(result.solana).toBeDefined();
      expect(result.evm).toBeDefined();
      expect(mockClient.createWalletAccounts).toHaveBeenCalledTimes(3);
    });

    it('should handle partial success (some chains fail)', async () => {
      // Arrange
      const mockSuccessResponse = {
        activity: {
          result: {
            createWalletAccountsResult: {
              addresses: [
                {
                  accountId: 'account_123',
                  address: '0x123abc',
                },
              ],
            },
          },
        },
      };

      // Mock one success and two failures
      mockClient.createWalletAccounts
        .mockResolvedValueOnce(mockSuccessResponse) // aptos succeeds
        .mockRejectedValueOnce(new Error('Solana failed')) // solana fails
        .mockRejectedValueOnce(new Error('EVM failed')); // evm fails

      // Act
      const result = await turnkeyService.createWalletAccounts(walletId, chains, userId);

      // Assert
      expect(Object.keys(result)).toHaveLength(1);
      expect(result.aptos).toBeDefined();
      expect(result.solana).toBeUndefined();
      expect(result.evm).toBeUndefined();
    });

    it('should throw error if all chains fail', async () => {
      // Arrange
      mockClient.createWalletAccounts.mockRejectedValue(new Error('All failed'));

      // Act & Assert
      await expect(
        turnkeyService.createWalletAccounts(walletId, chains, userId)
      ).rejects.toThrow('Failed to create any wallet accounts');
    });

    it('should throw error for unsupported chain', async () => {
      // Arrange
      const invalidChains = ['bitcoin'] as any;

      // Act & Assert
      await expect(
        turnkeyService.createWalletAccounts(walletId, invalidChains, userId)
      ).rejects.toThrow('Unsupported chain: bitcoin');
    });
  });

  describe('validateAddress', () => {
    it('should validate EVM addresses correctly', () => {
      // Valid EVM address
      expect(turnkeyService.validateAddress('0x1234567890abcdef1234567890abcdef12345678', 'evm')).toBe(true);
      
      // Invalid EVM address
      expect(turnkeyService.validateAddress('0x123', 'evm')).toBe(false);
      expect(turnkeyService.validateAddress('1234567890abcdef1234567890abcdef12345678', 'evm')).toBe(false);
    });

    it('should validate Solana addresses correctly', () => {
      // Valid Solana address (base58, ~44 chars)
      expect(turnkeyService.validateAddress('5Kb8kLf5zA1VPGKgLYkVBUPgXQGXZxNHtNQhfS8qCxC8', 'solana')).toBe(true);
      
      // Invalid Solana address
      expect(turnkeyService.validateAddress('0x123abc', 'solana')).toBe(false);
      expect(turnkeyService.validateAddress('short', 'solana')).toBe(false);
    });

    it('should validate Aptos addresses correctly', () => {
      // Valid Aptos address
      expect(turnkeyService.validateAddress('0x1234abcd', 'aptos')).toBe(true);
      expect(turnkeyService.validateAddress('0xa', 'aptos')).toBe(true);
      
      // Invalid Aptos address
      expect(turnkeyService.validateAddress('1234abcd', 'aptos')).toBe(false);
      expect(turnkeyService.validateAddress('0x', 'aptos')).toBe(false);
    });

    it('should return false for unknown chains', () => {
      expect(turnkeyService.validateAddress('0x123', 'bitcoin' as any)).toBe(false);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status on success', async () => {
      // Arrange
      const mockOrgResponse = { id: 'org_123', name: 'Test Org' };
      mockClient.getOrganization.mockResolvedValueOnce(mockOrgResponse);

      // Act
      const result = await turnkeyService.healthCheck();

      // Assert
      expect(result.status).toBe('healthy');
      expect(result.latency).toBeGreaterThan(0);
      expect(mockClient.getOrganization).toHaveBeenCalled();
    });

    it('should return unhealthy status on failure', async () => {
      // Arrange
      mockClient.getOrganization.mockRejectedValueOnce(new Error('Connection failed'));

      // Act
      const result = await turnkeyService.healthCheck();

      // Assert
      expect(result.status).toBe('unhealthy');
      expect(result.latency).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle 4xx errors as non-retryable', async () => {
      // Arrange
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      };
      mockClient.createWallet.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(turnkeyService.getOrCreateWallet('user_123')).rejects.toMatchObject({
        isRetryable: false,
        code: 'TURNKEY_CLIENT_ERROR',
      });
    });

    it('should handle 5xx errors as retryable', async () => {
      // Arrange
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };
      mockClient.createWallet.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(turnkeyService.getOrCreateWallet('user_123')).rejects.toMatchObject({
        isRetryable: true,
        code: 'TURNKEY_SERVER_ERROR',
      });
    });

    it('should handle network errors as retryable', async () => {
      // Arrange
      const error = { code: 'ENOTFOUND' };
      mockClient.createWallet.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(turnkeyService.getOrCreateWallet('user_123')).rejects.toMatchObject({
        isRetryable: true,
        code: 'TURNKEY_NETWORK_ERROR',
      });
    });
  });
});