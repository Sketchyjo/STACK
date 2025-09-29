import { prisma } from '@stack/database';
import { ChainType, WalletStatus, KYCStatus } from '@prisma/client';
import { TurnkeyService, TurnkeyAccount } from './turnkey.service';
import { AuditService } from './audit.service';
import { ContextualLogger, createLogger, withTiming } from './logger.service';
import { getEnabledChains, CHAIN_CONFIG, SupportedChain } from '../config';
import { 
  WalletProvisionResponse, 
  WalletListResponse,
  ChainType as SharedChainType 
} from '@stack/shared-types';

export class WalletServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'WalletServiceError';
  }
}

export interface ProvisionWalletOptions {
  chains?: SupportedChain[];
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class WalletService {
  private turnkeyService: TurnkeyService;
  private auditService: AuditService;
  private logger: ContextualLogger;

  constructor(correlationId?: string) {
    const corrId = correlationId || 'wallet-service';
    this.turnkeyService = new TurnkeyService(corrId);
    this.auditService = new AuditService(corrId);
    this.logger = createLogger({
      correlationId: corrId,
      service: 'WalletService',
    });
  }

  /**
   * Provision wallets for a user across multiple chains
   */
  async provisionWallets(
    userId: string,
    options: ProvisionWalletOptions = {}
  ): Promise<WalletProvisionResponse> {
    return withTiming(this.logger, 'provisionWallets', async () => {
      const { chains, correlationId, ipAddress, userAgent } = options;

      this.logger.info('Starting wallet provisioning', { userId, chains });

      // Validate user and KYC status
      const user = await this.validateUser(userId);

      // Determine which chains to provision
      const chainsToProvision = chains || getEnabledChains();
      this.logger.info('Chains to provision', { chainsToProvision });

      if (chainsToProvision.length === 0) {
        throw new WalletServiceError(
          'No chains enabled for wallet provisioning',
          'NO_ENABLED_CHAINS'
        );
      }

      try {
        // Get or create Turnkey wallet
        const turnkeyWallet = await this.turnkeyService.getOrCreateWallet(userId);

        // Check for existing wallets and filter out already provisioned chains
        const existingWallets = await this.getExistingWallets(userId);
        const existingChains = existingWallets.map(w => this.mapChainTypeToSupportedChain(w.chain));
        const newChains = chainsToProvision.filter(chain => !existingChains.includes(chain));

        this.logger.info('Wallet provisioning analysis', {
          existingChains,
          newChains,
          totalRequested: chainsToProvision.length,
        });

        let newAccounts: Record<SupportedChain, TurnkeyAccount> = {};

        // Create accounts for new chains if any
        if (newChains.length > 0) {
          newAccounts = await this.turnkeyService.createWalletAccounts(
            turnkeyWallet.walletId,
            newChains,
            userId
          );

          // Persist new wallets to database
          await this.persistWallets(userId, turnkeyWallet.walletId, newAccounts, {
            correlationId,
            ipAddress,
            userAgent,
          });
        }

        // Get all wallets (existing + newly created) to return
        const allWallets = await this.getExistingWallets(userId);
        const response = this.buildWalletResponse(userId, allWallets, chainsToProvision);

        this.logger.info('Wallet provisioning completed', {
          userId,
          totalWallets: allWallets.length,
          newlyCreated: Object.keys(newAccounts).length,
        });

        return response;
      } catch (error) {
        this.logger.error('Wallet provisioning failed', error, { userId, chainsToProvision });

        // Log audit failure for each requested chain
        for (const chain of chainsToProvision) {
          await this.auditService.logWalletCreationFailure({
            userId,
            chain,
            error: error.message,
            correlationId,
            ipAddress,
            userAgent,
            details: { originalError: error.name },
          });
        }

        throw error;
      }
    });
  }

  /**
   * Get all wallets for a user
   */
  async getUserWallets(userId: string): Promise<WalletListResponse> {
    return withTiming(this.logger, 'getUserWallets', async () => {
      this.logger.info('Retrieving user wallets', { userId });

      // Validate user exists
      await this.validateUser(userId);

      // Get wallets from database
      const wallets = await this.getExistingWallets(userId);
      
      // Get all enabled chains for the response
      const enabledChains = getEnabledChains();
      const response = this.buildWalletResponse(userId, wallets, enabledChains);

      this.logger.info('Retrieved user wallets', {
        userId,
        walletCount: wallets.length,
        chains: Object.keys(response.wallets),
      });

      return response;
    });
  }

  /**
   * Validate user exists and has appropriate KYC status
   */
  private async validateUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        kycStatus: true,
        kycCompletedAt: true,
      },
    });

    if (!user) {
      throw new WalletServiceError(
        'User not found',
        'USER_NOT_FOUND'
      );
    }

    // Check KYC status - only allow wallet provisioning for KYC passed users
    if (user.kycStatus !== KYCStatus.PASSED) {
      throw new WalletServiceError(
        `Wallet provisioning requires KYC completion. Current status: ${user.kycStatus}`,
        'KYC_REQUIRED',
        { kycStatus: user.kycStatus }
      );
    }

    return user;
  }

  /**
   * Get existing wallets for a user from database
   */
  private async getExistingWallets(userId: string) {
    return await prisma.wallet.findMany({
      where: {
        userId,
        status: WalletStatus.ACTIVE,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Persist new wallets to database with audit logging
   */
  private async persistWallets(
    userId: string,
    turnkeyWalletId: string,
    accounts: Record<SupportedChain, TurnkeyAccount>,
    auditContext: {
      correlationId?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ) {
    const { correlationId, ipAddress, userAgent } = auditContext;

    for (const [chain, account] of Object.entries(accounts)) {
      try {
        const wallet = await prisma.wallet.create({
          data: {
            userId,
            chain: this.mapSupportedChainToChainType(chain as SupportedChain),
            address: account.address,
            turnkeyWalletId,
            turnkeyAccountId: account.accountId,
            addressType: account.addressType,
            status: WalletStatus.ACTIVE,
          },
        });

        // Log successful creation
        await this.auditService.logWalletCreation({
          userId,
          walletId: wallet.id,
          chain,
          address: account.address,
          turnkeyWalletId,
          turnkeyAccountId: account.accountId,
          correlationId,
          ipAddress,
          userAgent,
        });

        this.logger.info('Wallet persisted successfully', {
          walletId: wallet.id,
          chain,
          address: account.address,
        });
      } catch (error) {
        this.logger.error(`Failed to persist ${chain} wallet`, error, {
          userId,
          chain,
          address: account.address,
        });

        // Log failure
        await this.auditService.logWalletCreationFailure({
          userId,
          chain,
          error: error.message,
          correlationId,
          ipAddress,
          userAgent,
          details: { 
            turnkeyAccountId: account.accountId,
            address: account.address,
          },
        });

        throw error;
      }
    }
  }

  /**
   * Build the standard wallet response format
   */
  private buildWalletResponse(
    userId: string,
    wallets: any[],
    requestedChains: SupportedChain[]
  ): WalletProvisionResponse {
    const walletData: Record<string, any> = {};

    // Add wallet data for chains that have been provisioned
    for (const wallet of wallets) {
      const chainKey = this.mapChainTypeToSupportedChain(wallet.chain);
      
      // Only include if it was requested or if this is a general listing
      if (requestedChains.includes(chainKey)) {
        walletData[chainKey] = {
          address: wallet.address,
          turnkey: {
            walletId: wallet.turnkeyWalletId,
            accountId: wallet.turnkeyAccountId,
            addressType: wallet.addressType,
          },
        };
      }
    }

    return {
      userId,
      wallets: walletData,
    };
  }

  /**
   * Map database ChainType to SupportedChain
   */
  private mapChainTypeToSupportedChain(chainType: ChainType): SupportedChain {
    switch (chainType) {
      case ChainType.APTOS:
        return 'aptos';
      case ChainType.SOLANA:
        return 'solana';
      case ChainType.EVM:
        return 'evm';
      default:
        throw new Error(`Unknown chain type: ${chainType}`);
    }
  }

  /**
   * Map SupportedChain to database ChainType
   */
  private mapSupportedChainToChainType(chain: SupportedChain): ChainType {
    switch (chain) {
      case 'aptos':
        return ChainType.APTOS;
      case 'solana':
        return ChainType.SOLANA;
      case 'evm':
        return ChainType.EVM;
      default:
        throw new Error(`Unknown supported chain: ${chain}`);
    }
  }

  /**
   * Get wallet statistics for monitoring
   */
  async getWalletStats(): Promise<{
    totalWallets: number;
    activeWallets: number;
    chainBreakdown: Record<string, number>;
    recentCreations: number;
  }> {
    try {
      const [totalWallets, chainStats, recentCount] = await Promise.all([
        prisma.wallet.count(),
        prisma.wallet.groupBy({
          by: ['chain'],
          where: {
            status: WalletStatus.ACTIVE,
          },
          _count: true,
        }),
        prisma.wallet.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
      ]);

      const activeWallets = chainStats.reduce((sum, stat) => sum + stat._count, 0);
      const chainBreakdown = chainStats.reduce((acc, stat) => {
        acc[stat.chain] = stat._count;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalWallets,
        activeWallets,
        chainBreakdown,
        recentCreations: recentCount,
      };
    } catch (error) {
      this.logger.error('Failed to get wallet statistics', error);
      throw error;
    }
  }

  /**
   * Health check for wallet service
   */
  async healthCheck(): Promise<{
    status: string;
    turnkey: { status: string; latency: number };
    database: { status: string; latency: number };
  }> {
    const [turnkeyHealth, dbHealth] = await Promise.all([
      this.turnkeyService.healthCheck(),
      this.checkDatabaseHealth(),
    ]);

    const overallStatus = turnkeyHealth.status === 'healthy' && dbHealth.status === 'healthy' 
      ? 'healthy' 
      : 'unhealthy';

    return {
      status: overallStatus,
      turnkey: turnkeyHealth,
      database: dbHealth,
    };
  }

  /**
   * Database health check
   */
  private async checkDatabaseHealth(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return { status: 'healthy', latency };
    } catch (error) {
      const latency = Date.now() - start;
      this.logger.error('Database health check failed', error);
      return { status: 'unhealthy', latency };
    }
  }
}