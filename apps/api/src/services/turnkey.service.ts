import { TurnkeyClient } from '@turnkey/http';
import { ApiKeyStamper } from '@turnkey/api-key-stamper';
import { config, CHAIN_CONFIG, SupportedChain } from '../config';
import { ContextualLogger, createLogger, withTiming } from './logger.service';
import { v4 as uuidv4 } from 'uuid';

export interface TurnkeyWallet {
  walletId: string;
  walletName: string;
}

export interface TurnkeyAccount {
  accountId: string;
  address: string;
  addressType: string;
  walletId: string;
}

export interface CreateWalletResult {
  walletId: string;
  accounts: Record<SupportedChain, TurnkeyAccount>;
}

export class TurnkeyServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'TurnkeyServiceError';
  }
}

export class TurnkeyService {
  private client: TurnkeyClient;
  private logger: ContextualLogger;

  constructor(correlationId?: string) {
    this.logger = createLogger({
      correlationId: correlationId || uuidv4(),
      service: 'TurnkeyService',
    });

    // Initialize Turnkey client with API key stamper
    const stamper = new ApiKeyStamper({
      apiPublicKey: config.TURNKEY_API_KEY,
      apiPrivateKey: config.TURNKEY_PRIVATE_KEY,
    });

    this.client = new TurnkeyClient({
      baseUrl: config.TURNKEY_BASE_URL,
      stamper,
      organizationId: config.TURNKEY_ORG_ID,
    });

    this.logger.info('TurnkeyService initialized', {
      baseUrl: config.TURNKEY_BASE_URL,
      organizationId: config.TURNKEY_ORG_ID,
    });
  }

  /**
   * Get or create a Turnkey wallet for a user
   */
  async getOrCreateWallet(userId: string): Promise<TurnkeyWallet> {
    return withTiming(this.logger, 'getOrCreateWallet', async () => {
      const walletName = `stack-user-${userId}`;
      
      try {
        // First, try to find existing wallet
        const existingWallet = await this.findWalletByName(walletName);
        if (existingWallet) {
          this.logger.info('Found existing wallet', { walletId: existingWallet.walletId, userId });
          return existingWallet;
        }

        // Create new wallet if none exists
        this.logger.info('Creating new wallet', { walletName, userId });
        return await this.createWallet(walletName, userId);
      } catch (error) {
        this.logger.error('Failed to get or create wallet', error, { userId, walletName });
        throw this.handleTurnkeyError(error, 'WALLET_CREATION_FAILED');
      }
    });
  }

  /**
   * Create wallet accounts for specified chains
   */
  async createWalletAccounts(
    walletId: string, 
    chains: SupportedChain[],
    userId: string
  ): Promise<Record<SupportedChain, TurnkeyAccount>> {
    return withTiming(this.logger, 'createWalletAccounts', async () => {
      const results: Record<SupportedChain, TurnkeyAccount> = {} as any;
      const errors: { chain: SupportedChain; error: any }[] = [];

      this.logger.info('Creating wallet accounts', { walletId, chains, userId });

      // Create accounts for each chain in parallel
      const promises = chains.map(async (chain) => {
        try {
          const account = await this.createWalletAccount(walletId, chain, userId);
          results[chain] = account;
          this.logger.info('Account created successfully', { 
            chain, 
            accountId: account.accountId, 
            address: account.address 
          });
        } catch (error) {
          errors.push({ chain, error });
          this.logger.error(`Failed to create ${chain} account`, error, { walletId, userId });
        }
      });

      await Promise.all(promises);

      // If we have any successful results, return them
      // Partial success is acceptable as per the story requirements
      if (Object.keys(results).length > 0) {
        if (errors.length > 0) {
          this.logger.warn('Partial success in account creation', { 
            successful: Object.keys(results), 
            failed: errors.map(e => e.chain) 
          });
        }
        return results;
      }

      // If all failed, throw error
      throw new TurnkeyServiceError(
        `Failed to create any wallet accounts: ${errors.map(e => `${e.chain}: ${e.error.message}`).join(', ')}`,
        'ALL_ACCOUNTS_FAILED',
        errors
      );
    });
  }

  /**
   * Create a single wallet account for a specific chain
   */
  private async createWalletAccount(
    walletId: string, 
    chain: SupportedChain,
    userId: string
  ): Promise<TurnkeyAccount> {
    const chainConfig = CHAIN_CONFIG[chain];
    if (!chainConfig) {
      throw new TurnkeyServiceError(`Unsupported chain: ${chain}`, 'UNSUPPORTED_CHAIN');
    }

    const accountName = `${chain}-account-${Date.now()}`;
    const idempotencyKey = uuidv4();

    try {
      this.logger.debug('Creating wallet account', {
        walletId,
        chain,
        addressType: chainConfig.addressType,
        accountName,
        idempotencyKey,
      });

      const response = await this.client.createWalletAccounts({
        type: 'ACTIVITY_TYPE_CREATE_WALLET_ACCOUNTS',
        timestampMs: Date.now().toString(),
        organizationId: config.TURNKEY_ORG_ID,
        parameters: {
          walletId: walletId,
          accounts: [
            {
              accountName: accountName,
              addressType: chainConfig.addressType,
            },
          ],
        },
      });

      if (!response.activity.result?.createWalletAccountsResult?.addresses) {
        throw new TurnkeyServiceError(
          'No addresses returned from Turnkey',
          'INVALID_TURNKEY_RESPONSE',
          response
        );
      }

      const addresses = response.activity.result.createWalletAccountsResult.addresses;
      const address = addresses[0];

      if (!address) {
        throw new TurnkeyServiceError(
          'No address created for account',
          'NO_ADDRESS_CREATED',
          response
        );
      }

      const account: TurnkeyAccount = {
        accountId: address.accountId,
        address: address.address,
        addressType: chainConfig.addressType,
        walletId: walletId,
      };

      this.logger.info('Wallet account created successfully', {
        chain,
        accountId: account.accountId,
        address: account.address,
        addressType: account.addressType,
      });

      // Increment success metrics
      this.logger.metric('turnkey_account_creation_success', 1, { chain });

      return account;
    } catch (error) {
      this.logger.error(`Failed to create ${chain} account`, error, {
        walletId,
        chain,
        accountName,
        idempotencyKey,
      });

      // Increment failure metrics
      this.logger.metric('turnkey_account_creation_failure', 1, { 
        chain, 
        error_type: error.name || 'unknown' 
      });

      throw this.handleTurnkeyError(error, 'ACCOUNT_CREATION_FAILED');
    }
  }

  /**
   * Find wallet by name
   */
  private async findWalletByName(walletName: string): Promise<TurnkeyWallet | null> {
    try {
      // Note: This is a simplified implementation
      // In practice, you might need to implement wallet lookup differently
      // based on Turnkey's actual API for wallet discovery
      
      // For now, we'll assume wallet creation is always needed
      // This can be enhanced based on actual Turnkey SDK capabilities
      return null;
    } catch (error) {
      this.logger.warn('Error finding wallet by name', error, { walletName });
      return null;
    }
  }

  /**
   * Create a new Turnkey wallet
   */
  private async createWallet(walletName: string, userId: string): Promise<TurnkeyWallet> {
    const idempotencyKey = uuidv4();

    try {
      this.logger.debug('Creating Turnkey wallet', { walletName, userId, idempotencyKey });

      const response = await this.client.createWallet({
        type: 'ACTIVITY_TYPE_CREATE_WALLET',
        timestampMs: Date.now().toString(),
        organizationId: config.TURNKEY_ORG_ID,
        parameters: {
          walletName: walletName,
          accounts: [], // We'll create accounts separately
        },
      });

      if (!response.activity.result?.createWalletResult?.walletId) {
        throw new TurnkeyServiceError(
          'No wallet ID returned from Turnkey',
          'INVALID_TURNKEY_RESPONSE',
          response
        );
      }

      const walletId = response.activity.result.createWalletResult.walletId;

      this.logger.info('Turnkey wallet created successfully', {
        walletId,
        walletName,
        userId,
      });

      // Increment success metrics
      this.logger.metric('turnkey_wallet_creation_success', 1, { userId });

      return {
        walletId,
        walletName,
      };
    } catch (error) {
      this.logger.error('Failed to create Turnkey wallet', error, {
        walletName,
        userId,
        idempotencyKey,
      });

      // Increment failure metrics
      this.logger.metric('turnkey_wallet_creation_failure', 1, { 
        userId, 
        error_type: error.name || 'unknown' 
      });

      throw this.handleTurnkeyError(error, 'WALLET_CREATION_FAILED');
    }
  }

  /**
   * Handle Turnkey API errors and convert them to service errors
   */
  private handleTurnkeyError(error: any, defaultCode: string): TurnkeyServiceError {
    // Handle HTTP errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // 4xx errors are typically client errors (not retryable)
      if (status >= 400 && status < 500) {
        return new TurnkeyServiceError(
          data?.message || error.message || 'Turnkey client error',
          'TURNKEY_CLIENT_ERROR',
          { status, data },
          false
        );
      }

      // 5xx errors are server errors (retryable)
      if (status >= 500) {
        return new TurnkeyServiceError(
          data?.message || error.message || 'Turnkey server error',
          'TURNKEY_SERVER_ERROR',
          { status, data },
          true
        );
      }
    }

    // Network errors (retryable)
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return new TurnkeyServiceError(
        'Network error connecting to Turnkey',
        'TURNKEY_NETWORK_ERROR',
        error,
        true
      );
    }

    // Already a TurnkeyServiceError
    if (error instanceof TurnkeyServiceError) {
      return error;
    }

    // Generic error
    return new TurnkeyServiceError(
      error.message || 'Unknown Turnkey error',
      defaultCode,
      error
    );
  }

  /**
   * Validate wallet addresses (utility method)
   */
  validateAddress(address: string, chain: SupportedChain): boolean {
    try {
      switch (chain) {
        case 'evm':
          // Basic EVM address validation (starts with 0x, 42 chars)
          return /^0x[a-fA-F0-9]{40}$/.test(address);
        
        case 'solana':
          // Basic Solana address validation (base58, ~44 chars)
          return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
        
        case 'aptos':
          // Basic Aptos address validation (starts with 0x, varies length)
          return /^0x[a-fA-F0-9]+$/.test(address) && address.length >= 3;
        
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Health check for Turnkey service
   */
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      // Simple organization info call to check connectivity
      await this.client.getOrganization({
        organizationId: config.TURNKEY_ORG_ID,
      });
      
      const latency = Date.now() - start;
      this.logger.info('Turnkey health check passed', { latency });
      return { status: 'healthy', latency };
    } catch (error) {
      const latency = Date.now() - start;
      this.logger.error('Turnkey health check failed', error, { latency });
      return { status: 'unhealthy', latency };
    }
  }
}