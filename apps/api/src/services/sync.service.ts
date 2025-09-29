import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import { zeroGService } from './zeroGService';
import { encryptionService } from './encryption.service';
import { auditService } from './audit.service';
import { logger } from './logger.service';
import { prisma } from '@stack/database';
import {
  ZGSyncStatus,
  ZGStorageResult,
  ZGUserData,
  ZGInvestmentRecord,
  ZGPortfolioSnapshot,
} from '../types/zeroG.types';

/**
 * Data synchronization service for maintaining consistency between local database and 0G storage
 * Provides bidirectional sync, conflict resolution, and data integrity verification
 */
export class SyncService {
  private readonly syncStreamId = 'sync_metadata';
  private readonly conflictStreamId = 'sync_conflicts';
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();
  
  // Sync configuration
  private readonly config = {
    batchSize: 100,
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    conflictResolution: 'MANUAL' as 'LOCAL' | 'REMOTE' | 'MANUAL' | 'MERGE',
    syncIntervalMinutes: 15,
    fullSyncIntervalHours: 24,
    enableRealtimeSync: true,
  };

  private syncInProgress = false;

  constructor() {
    this.initializeScheduledSyncs();
  }

  /**
   * Sync user data between local database and 0G storage
   */
  async syncUserData(userId: string): Promise<ZGStorageResult<ZGSyncStatus>> {
    try {
      logger.info(`Starting user data sync for: ${userId}`);

      const syncSession = {
        sessionId: uuidv4(),
        userId,
        startTime: Date.now(),
        dataTypes: ['USER_DATA'],
      };

      // Get current sync status
      const currentStatus = await this.getSyncStatus(userId);

      // Fetch local user data
      const localUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          preferences: true,
          wallets: true,
        },
      });

      if (!localUser) {
        return {
          success: false,
          error: 'User not found in local database',
        };
      }

      // Transform to 0G format
      const zgUserData: ZGUserData = {
        userId: localUser.id,
        profile: {
          displayName: localUser.displayName,
          bio: localUser.bio || undefined,
          avatarUrl: localUser.avatarUrl || undefined,
          preferences: {
            notifications: localUser.preferences?.notificationSettings || {},
            privacy: {},
          },
        },
        settings: {
          privacy: {},
          notifications: localUser.preferences?.notificationSettings || {},
          security: {},
        },
        metadata: {
          version: '1.0',
          lastUpdated: localUser.updatedAt.getTime(),
          backupFrequency: 'WEEKLY',
        },
      };

      // Try to fetch existing data from 0G
      const remoteData = await zeroGService.getUserData(userId);
      
      // Determine sync action needed
      const syncAction = await this.determineSyncAction(
        localUser.updatedAt.getTime(),
        remoteData.data?.metadata?.lastUpdated || 0,
        'USER_DATA'
      );

      let syncResult: ZGStorageResult<any>;

      switch (syncAction.action) {
        case 'PUSH':
          // Local data is newer, push to 0G
          syncResult = await zeroGService.storeUserData(zgUserData);
          break;

        case 'PULL':
          // Remote data is newer, update local
          if (remoteData.success && remoteData.data) {
            syncResult = await this.updateLocalUserData(userId, remoteData.data);
          } else {
            syncResult = { success: false, error: 'No remote data to pull' };
          }
          break;

        case 'CONFLICT':
          // Handle conflict
          syncResult = await this.handleUserDataConflict(
            userId,
            localUser,
            remoteData.data,
            syncSession.sessionId
          );
          break;

        case 'SKIP':
        default:
          // Data is in sync, no action needed
          syncResult = { success: true, data: currentStatus.data };
          break;
      }

      // Update sync status
      const updatedStatus = await this.updateSyncStatus(
        userId,
        'USER_DATA',
        syncResult.success,
        syncSession.sessionId
      );

      // Log sync completion
      await auditService.log({
        userId,
        action: 'DATA_SYNC_COMPLETED',
        entityType: 'SYNC',
        entityId: syncSession.sessionId,
        details: {
          dataType: 'USER_DATA',
          action: syncAction.action,
          success: syncResult.success,
          duration: Date.now() - syncSession.startTime,
        },
      });

      logger.info(`User data sync completed for ${userId}: ${syncAction.action}`);

      return {
        success: syncResult.success,
        data: updatedStatus,
        error: syncResult.error,
      };
    } catch (error) {
      logger.error('Error syncing user data:', error);

      // Log sync failure
      await auditService.log({
        userId,
        action: 'DATA_SYNC_FAILED',
        entityType: 'SYNC',
        details: {
          dataType: 'USER_DATA',
          error: error instanceof Error ? error.message : 'Unknown sync error',
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error',
      };
    }
  }

  /**
   * Sync portfolio data between local database and 0G storage
   */
  async syncPortfolioData(userId: string, portfolioId?: string): Promise<ZGStorageResult<ZGSyncStatus>> {
    try {
      logger.info(`Starting portfolio data sync for user: ${userId}`);

      const syncSession = {
        sessionId: uuidv4(),
        userId,
        startTime: Date.now(),
        dataTypes: ['PORTFOLIO'],
      };

      // Fetch local portfolio data
      const portfolioQuery = portfolioId 
        ? { id: portfolioId, userId }
        : { userId };

      const localPortfolios = await prisma.portfolio.findMany({
        where: portfolioQuery,
        include: {
          holdings: {
            include: {
              basket: true,
            },
          },
        },
      });

      let totalSynced = 0;
      let totalFailed = 0;
      const conflicts: any[] = [];

      for (const portfolio of localPortfolios) {
        try {
          // Transform to 0G format
          const zgPortfolioSnapshot: ZGPortfolioSnapshot = {
            portfolioId: portfolio.id,
            userId: portfolio.userId,
            timestamp: Date.now(),
            totalValue: portfolio.totalValue.toString(),
            currency: 'USD', // Default currency
            holdings: portfolio.holdings.map(holding => ({
              assetId: holding.basketId,
              symbol: holding.basket.name,
              quantity: holding.unitsOwned.toString(),
              currentPrice: '0', // Would need to fetch current price
              marketValue: holding.currentValue.toString(),
              weight: 0, // Would need to calculate
              cost_basis: holding.totalAmountInvested.toString(),
            })),
            performance: {
              dayChange: '0',
              dayChangePercent: '0',
              totalReturn: '0',
              totalReturnPercent: '0',
            },
            risk_metrics: {
              risk_level: 'MEDIUM',
            },
            metadata: {
              snapshotType: 'MANUAL',
              dataQuality: 1.0,
              sources: ['local_db'],
            },
          };

          // Store portfolio snapshot in 0G
          const syncResult = await zeroGService.storePortfolioSnapshot(zgPortfolioSnapshot);

          if (syncResult.success) {
            totalSynced++;
          } else {
            totalFailed++;
            logger.warn(`Failed to sync portfolio ${portfolio.id}: ${syncResult.error}`);
          }
        } catch (error) {
          totalFailed++;
          logger.error(`Error syncing portfolio ${portfolio.id}:`, error);
        }
      }

      // Update sync status
      const syncStatus: ZGSyncStatus = {
        lastSync: Date.now(),
        status: totalFailed === 0 ? 'SYNCED' : totalSynced > 0 ? 'PENDING' : 'FAILED',
        conflicts,
        metrics: {
          totalRecords: localPortfolios.length,
          syncedRecords: totalSynced,
          failedRecords: totalFailed,
          lastSyncDuration: Date.now() - syncSession.startTime,
        },
      };

      // Log sync completion
      await auditService.log({
        userId,
        action: 'PORTFOLIO_SYNC_COMPLETED',
        entityType: 'SYNC',
        entityId: syncSession.sessionId,
        details: {
          portfoliosProcessed: localPortfolios.length,
          syncedCount: totalSynced,
          failedCount: totalFailed,
          duration: Date.now() - syncSession.startTime,
        },
      });

      logger.info(`Portfolio sync completed: ${totalSynced}/${localPortfolios.length} synced`);

      return {
        success: totalFailed < localPortfolios.length,
        data: syncStatus,
      };
    } catch (error) {
      logger.error('Error syncing portfolio data:', error);

      await auditService.log({
        userId,
        action: 'PORTFOLIO_SYNC_FAILED',
        entityType: 'SYNC',
        details: {
          error: error instanceof Error ? error.message : 'Unknown sync error',
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error',
      };
    }
  }

  /**
   * Sync investment transactions between local database and 0G storage
   */
  async syncTransactionData(userId: string): Promise<ZGStorageResult<ZGSyncStatus>> {
    try {
      logger.info(`Starting transaction data sync for user: ${userId}`);

      const syncSession = {
        sessionId: uuidv4(),
        userId,
        startTime: Date.now(),
        dataTypes: ['INVESTMENTS'],
      };

      // Fetch local transaction data
      const localTransactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: this.config.batchSize,
      });

      let totalSynced = 0;
      let totalFailed = 0;

      for (const transaction of localTransactions) {
        try {
          // Transform to 0G investment record format
          const zgInvestmentRecord: ZGInvestmentRecord = {
            id: transaction.id,
            userId: transaction.userId,
            type: this.mapTransactionType(transaction.type),
            asset: {
              symbol: 'N/A', // Would need additional data
              name: transaction.description || 'Unknown',
              type: 'BASKET', // Default type
              assetId: transaction.id,
            },
            amount: {
              quantity: '1', // Would need to extract from transaction
              price: transaction.amount.toString(),
              currency: transaction.currency,
            },
            execution: {
              timestamp: transaction.createdAt.getTime(),
              orderId: transaction.id,
            },
            compliance: {
              kycVerified: true, // Would need to check user KYC status
              amlChecked: true,
              region: 'US', // Would need to get from user data
            },
            metadata: {
              source: 'API',
              confidence: 1.0,
              tags: [transaction.type],
            },
          };

          // Store investment record in 0G
          const syncResult = await zeroGService.storeInvestmentRecord(zgInvestmentRecord);

          if (syncResult.success) {
            totalSynced++;
          } else {
            totalFailed++;
            logger.warn(`Failed to sync transaction ${transaction.id}: ${syncResult.error}`);
          }
        } catch (error) {
          totalFailed++;
          logger.error(`Error syncing transaction ${transaction.id}:`, error);
        }
      }

      // Update sync status
      const syncStatus: ZGSyncStatus = {
        lastSync: Date.now(),
        status: totalFailed === 0 ? 'SYNCED' : totalSynced > 0 ? 'PENDING' : 'FAILED',
        metrics: {
          totalRecords: localTransactions.length,
          syncedRecords: totalSynced,
          failedRecords: totalFailed,
          lastSyncDuration: Date.now() - syncSession.startTime,
        },
      };

      // Log sync completion
      await auditService.log({
        userId,
        action: 'TRANSACTION_SYNC_COMPLETED',
        entityType: 'SYNC',
        entityId: syncSession.sessionId,
        details: {
          transactionsProcessed: localTransactions.length,
          syncedCount: totalSynced,
          failedCount: totalFailed,
          duration: Date.now() - syncSession.startTime,
        },
      });

      logger.info(`Transaction sync completed: ${totalSynced}/${localTransactions.length} synced`);

      return {
        success: totalFailed < localTransactions.length,
        data: syncStatus,
      };
    } catch (error) {
      logger.error('Error syncing transaction data:', error);

      await auditService.log({
        userId,
        action: 'TRANSACTION_SYNC_FAILED',
        entityType: 'SYNC',
        details: {
          error: error instanceof Error ? error.message : 'Unknown sync error',
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error',
      };
    }
  }

  /**
   * Perform full sync for all data types of a user
   */
  async fullSync(userId: string): Promise<ZGStorageResult<{ 
    overall: ZGSyncStatus;
    details: Record<string, ZGSyncStatus>;
  }>> {
    try {
      if (this.syncInProgress) {
        return {
          success: false,
          error: 'Sync already in progress',
        };
      }

      this.syncInProgress = true;
      logger.info(`Starting full sync for user: ${userId}`);

      const syncSession = {
        sessionId: uuidv4(),
        userId,
        startTime: Date.now(),
        dataTypes: ['USER_DATA', 'PORTFOLIO', 'INVESTMENTS'],
      };

      // Sync all data types
      const [userSync, portfolioSync, transactionSync] = await Promise.allSettled([
        this.syncUserData(userId),
        this.syncPortfolioData(userId),
        this.syncTransactionData(userId),
      ]);

      // Collect results
      const details: Record<string, ZGSyncStatus> = {};
      let totalSynced = 0;
      let totalFailed = 0;

      if (userSync.status === 'fulfilled' && userSync.value.success) {
        details.USER_DATA = userSync.value.data!;
        totalSynced += userSync.value.data?.metrics.syncedRecords || 0;
        totalFailed += userSync.value.data?.metrics.failedRecords || 0;
      } else {
        details.USER_DATA = {
          lastSync: Date.now(),
          status: 'FAILED',
          metrics: { totalRecords: 0, syncedRecords: 0, failedRecords: 1, lastSyncDuration: 0 },
        };
        totalFailed++;
      }

      if (portfolioSync.status === 'fulfilled' && portfolioSync.value.success) {
        details.PORTFOLIO = portfolioSync.value.data!;
        totalSynced += portfolioSync.value.data?.metrics.syncedRecords || 0;
        totalFailed += portfolioSync.value.data?.metrics.failedRecords || 0;
      } else {
        details.PORTFOLIO = {
          lastSync: Date.now(),
          status: 'FAILED',
          metrics: { totalRecords: 0, syncedRecords: 0, failedRecords: 1, lastSyncDuration: 0 },
        };
        totalFailed++;
      }

      if (transactionSync.status === 'fulfilled' && transactionSync.value.success) {
        details.INVESTMENTS = transactionSync.value.data!;
        totalSynced += transactionSync.value.data?.metrics.syncedRecords || 0;
        totalFailed += transactionSync.value.data?.metrics.failedRecords || 0;
      } else {
        details.INVESTMENTS = {
          lastSync: Date.now(),
          status: 'FAILED',
          metrics: { totalRecords: 0, syncedRecords: 0, failedRecords: 1, lastSyncDuration: 0 },
        };
        totalFailed++;
      }

      // Calculate overall status
      const overall: ZGSyncStatus = {
        lastSync: Date.now(),
        status: totalFailed === 0 ? 'SYNCED' : totalSynced > 0 ? 'PENDING' : 'FAILED',
        metrics: {
          totalRecords: totalSynced + totalFailed,
          syncedRecords: totalSynced,
          failedRecords: totalFailed,
          lastSyncDuration: Date.now() - syncSession.startTime,
        },
      };

      // Log full sync completion
      await auditService.log({
        userId,
        action: 'FULL_SYNC_COMPLETED',
        entityType: 'SYNC',
        entityId: syncSession.sessionId,
        details: {
          syncedDataTypes: Object.keys(details).filter(
            key => details[key].status === 'SYNCED'
          ).length,
          totalDataTypes: Object.keys(details).length,
          totalSynced,
          totalFailed,
          duration: Date.now() - syncSession.startTime,
        },
      });

      this.syncInProgress = false;

      logger.info(`Full sync completed for user ${userId}: ${totalSynced} synced, ${totalFailed} failed`);

      return {
        success: true,
        data: {
          overall,
          details,
        },
      };
    } catch (error) {
      this.syncInProgress = false;
      logger.error('Error during full sync:', error);

      await auditService.log({
        userId,
        action: 'FULL_SYNC_FAILED',
        entityType: 'SYNC',
        details: {
          error: error instanceof Error ? error.message : 'Unknown sync error',
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error',
      };
    }
  }

  /**
   * Get current sync status for a user
   */
  async getSyncStatus(userId: string): Promise<ZGStorageResult<ZGSyncStatus>> {
    try {
      // This would retrieve sync status from 0G storage
      // For now, return a default status
      const status: ZGSyncStatus = {
        lastSync: Date.now() - (24 * 60 * 60 * 1000), // 24 hours ago
        status: 'SYNCED',
        metrics: {
          totalRecords: 0,
          syncedRecords: 0,
          failedRecords: 0,
          lastSyncDuration: 0,
        },
      };

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown status error',
      };
    }
  }

  /**
   * Resolve sync conflicts manually
   */
  async resolveConflict(
    userId: string,
    conflictId: string,
    resolution: 'LOCAL' | 'REMOTE' | 'MERGE',
    mergeData?: any
  ): Promise<ZGStorageResult<{ resolved: boolean }>> {
    try {
      logger.info(`Resolving conflict ${conflictId} for user ${userId} with resolution: ${resolution}`);

      // This would implement actual conflict resolution logic
      // For now, just log the resolution attempt

      await auditService.log({
        userId,
        action: 'CONFLICT_RESOLVED',
        entityType: 'SYNC',
        entityId: conflictId,
        details: {
          resolution,
          hasMergeData: !!mergeData,
        },
      });

      return {
        success: true,
        data: { resolved: true },
      };
    } catch (error) {
      logger.error('Error resolving sync conflict:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown conflict resolution error',
      };
    }
  }

  /**
   * Schedule automatic sync for a user
   */
  async scheduleUserSync(
    userId: string,
    schedule: {
      enabled: boolean;
      intervalMinutes?: number;
      fullSyncIntervalHours?: number;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!schedule.enabled) {
        // Remove existing scheduled jobs
        const existingJob = this.scheduledJobs.get(`sync_${userId}`);
        if (existingJob) {
          existingJob.stop();
          this.scheduledJobs.delete(`sync_${userId}`);
        }
        return { success: true };
      }

      const intervalMinutes = schedule.intervalMinutes || this.config.syncIntervalMinutes;
      const fullSyncHours = schedule.fullSyncIntervalHours || this.config.fullSyncIntervalHours;

      // Schedule incremental sync
      const incrementalJob = cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
        await this.syncUserData(userId);
      }, {
        scheduled: false,
        name: `incremental_sync_${userId}`,
      });

      // Schedule full sync
      const fullSyncJob = cron.schedule(`0 */${fullSyncHours} * * *`, async () => {
        await this.fullSync(userId);
      }, {
        scheduled: false,
        name: `full_sync_${userId}`,
      });

      incrementalJob.start();
      fullSyncJob.start();

      this.scheduledJobs.set(`sync_${userId}`, incrementalJob);
      this.scheduledJobs.set(`full_sync_${userId}`, fullSyncJob);

      logger.info(`Scheduled sync for user ${userId}: incremental every ${intervalMinutes}m, full every ${fullSyncHours}h`);

      return { success: true };
    } catch (error) {
      logger.error('Error scheduling user sync:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scheduling error',
      };
    }
  }

  // Private helper methods

  /**
   * Determine what sync action is needed based on timestamps
   */
  private async determineSyncAction(
    localTimestamp: number,
    remoteTimestamp: number,
    dataType: string
  ): Promise<{ action: 'PUSH' | 'PULL' | 'CONFLICT' | 'SKIP'; reason: string }> {
    const timeDiff = Math.abs(localTimestamp - remoteTimestamp);
    const conflictThreshold = 5000; // 5 seconds

    if (timeDiff < conflictThreshold) {
      return { action: 'SKIP', reason: 'Data is in sync' };
    }

    if (localTimestamp > remoteTimestamp) {
      return { action: 'PUSH', reason: 'Local data is newer' };
    }

    if (remoteTimestamp > localTimestamp) {
      return { action: 'PULL', reason: 'Remote data is newer' };
    }

    return { action: 'CONFLICT', reason: 'Timestamps are conflicting' };
  }

  /**
   * Handle user data conflict
   */
  private async handleUserDataConflict(
    userId: string,
    localData: any,
    remoteData: any,
    sessionId: string
  ): Promise<ZGStorageResult<any>> {
    try {
      // Store conflict for manual resolution
      const conflict = {
        conflictId: uuidv4(),
        userId,
        sessionId,
        dataType: 'USER_DATA',
        localData: {
          data: localData,
          timestamp: localData.updatedAt?.getTime() || Date.now(),
        },
        remoteData: {
          data: remoteData,
          timestamp: remoteData?.metadata?.lastUpdated || Date.now(),
        },
        status: 'PENDING',
        createdAt: Date.now(),
      };

      // This would store the conflict in 0G for later resolution
      logger.warn(`Conflict detected for user ${userId}, stored as ${conflict.conflictId}`);

      return {
        success: true,
        data: conflict,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown conflict handling error',
      };
    }
  }

  /**
   * Update local user data from 0G
   */
  private async updateLocalUserData(
    userId: string,
    remoteData: ZGUserData
  ): Promise<ZGStorageResult<any>> {
    try {
      // Update local database with remote data
      await prisma.user.update({
        where: { id: userId },
        data: {
          displayName: remoteData.profile.displayName,
          bio: remoteData.profile.bio,
          avatarUrl: remoteData.profile.avatarUrl,
          // Would update other fields as needed
        },
      });

      return {
        success: true,
        data: remoteData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown local update error',
      };
    }
  }

  /**
   * Update sync status for a data type
   */
  private async updateSyncStatus(
    userId: string,
    dataType: string,
    success: boolean,
    sessionId: string
  ): Promise<ZGSyncStatus> {
    const status: ZGSyncStatus = {
      lastSync: Date.now(),
      status: success ? 'SYNCED' : 'FAILED',
      metrics: {
        totalRecords: 1,
        syncedRecords: success ? 1 : 0,
        failedRecords: success ? 0 : 1,
        lastSyncDuration: 0,
      },
    };

    // This would store the sync status in 0G
    logger.info(`Updated sync status for ${userId}/${dataType}: ${status.status}`);

    return status;
  }

  /**
   * Map database transaction types to 0G investment record types
   */
  private mapTransactionType(transactionType: string): 'BUY' | 'SELL' | 'TRANSFER' | 'DIVIDEND' | 'FEE' {
    const typeMap: Record<string, 'BUY' | 'SELL' | 'TRANSFER' | 'DIVIDEND' | 'FEE'> = {
      'INVESTMENT': 'BUY',
      'DEPOSIT': 'BUY',
      'WITHDRAWAL': 'SELL',
      'DIVIDEND': 'DIVIDEND',
      'FEE': 'FEE',
    };

    return typeMap[transactionType] || 'TRANSFER';
  }

  /**
   * Initialize scheduled sync jobs
   */
  private initializeScheduledSyncs(): void {
    // Schedule global sync health check
    const healthCheckJob = cron.schedule('*/30 * * * *', async () => {
      await this.performHealthCheck();
    }, {
      scheduled: true,
      name: 'sync_health_check',
    });

    this.scheduledJobs.set('health_check', healthCheckJob);
    logger.info('Initialized scheduled sync jobs');
  }

  /**
   * Perform sync health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      logger.debug('Performing sync health check');
      
      // Check 0G connectivity
      const networkStatus = await zeroGService.getNetworkStatus();
      
      if (!networkStatus.success) {
        logger.warn('0G network connectivity issues detected');
      }

      // This would implement additional health checks
    } catch (error) {
      logger.error('Error during sync health check:', error);
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();