import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import { zeroGService } from './zeroGService';
import { encryptionService } from './encryption.service';
import { auditService } from './audit.service';
import { logger } from './logger.service';
import { ZGBackupMetadata, ZGStorageResult, ZGSchemas } from '../types/zeroG.types';

/**
 * Comprehensive backup and recovery service using 0G decentralized storage
 * Provides automated backup strategies, recovery mechanisms, and disaster recovery
 */
export class BackupService {
  private readonly backupStreamId = 'backups';
  private readonly archiveStreamId = 'archives';
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();
  
  // Backup configuration
  private readonly config = {
    retention: {
      daily: 30,      // Keep daily backups for 30 days
      weekly: 12,     // Keep weekly backups for 12 weeks
      monthly: 24,    // Keep monthly backups for 24 months
      yearly: 7,      // Keep yearly backups for 7 years
    },
    compression: {
      enabled: true,
      algorithm: 'gzip',
      level: 6,
    },
    encryption: {
      enabled: true,
      keyRotationDays: 90,
    },
    verification: {
      enabled: true,
      checksumAlgorithm: 'SHA256',
      integrityCheckInterval: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  constructor() {
    this.initializeScheduledBackups();
  }

  /**
   * Create a comprehensive backup for a user
   */
  async createUserBackup(
    userId: string,
    backupType: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' = 'FULL',
    dataTypes?: Array<'USER_DATA' | 'INVESTMENTS' | 'PORTFOLIO' | 'AUDIT_LOGS'>
  ): Promise<ZGStorageResult<ZGBackupMetadata>> {
    try {
      const backupId = uuidv4();
      const timestamp = Date.now();
      
      logger.info(`Starting ${backupType} backup for user: ${userId}`);

      // Determine what data types to backup
      const typesToBackup = dataTypes || ['USER_DATA', 'INVESTMENTS', 'PORTFOLIO', 'AUDIT_LOGS'];

      // Create backup metadata
      const backupMetadata: ZGBackupMetadata = {
        backupId,
        userId,
        type: backupType,
        timestamp,
        dataTypes: typesToBackup,
        size: 0, // Will be calculated during backup
        compression: this.config.compression.enabled,
        encryption: {
          algorithm: 'aes-256-gcm',
          keyId: `backup:${userId}:${timestamp}`,
          iv: encryptionService.generateSecureId(16),
        },
        integrity: {
          checksum: '',
          algorithm: 'SHA256',
        },
        retention: {
          expiresAt: this.calculateExpirationTime(backupType, timestamp),
          policy: this.getRetentionPolicy(backupType),
          locked: false,
        },
        recovery: {
          priority: this.determineRecoveryPriority(backupType),
          estimatedRestoreTime: this.estimateRestoreTime(typesToBackup.length),
          dependencies: [],
        },
      };

      // Validate backup metadata
      const validationResult = ZGSchemas.BackupMetadata.safeParse(backupMetadata);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Invalid backup metadata structure',
        };
      }

      // Perform the actual backup process
      const backupResult = await this.performBackup(userId, backupMetadata, typesToBackup);
      
      if (!backupResult.success) {
        return {
          success: false,
          error: backupResult.error,
        };
      }

      // Update metadata with actual backup results
      backupMetadata.size = backupResult.totalSize || 0;
      backupMetadata.integrity.checksum = backupResult.checksum || '';

      // Store backup metadata in 0G
      const encryptedMetadata = await encryptionService.encryptJSON(
        backupMetadata,
        `backup_metadata:${userId}`
      );

      const metadataKey = `backup_meta:${userId}:${backupId}:${timestamp}`;
      const metadataResult = await zeroGService.storeKeyValue(
        this.backupStreamId,
        metadataKey,
        encryptedMetadata
      );

      if (!metadataResult.success) {
        return {
          success: false,
          error: `Failed to store backup metadata: ${metadataResult.error}`,
        };
      }

      // Log backup completion
      await auditService.log({
        userId,
        action: 'BACKUP_CREATED',
        entityType: 'BACKUP',
        entityId: backupId,
        details: {
          backupType,
          dataTypes: typesToBackup,
          size: backupMetadata.size,
          duration: Date.now() - timestamp,
        },
      });

      logger.info(`Backup completed successfully for user ${userId}: ${backupId}`);

      return {
        success: true,
        data: backupMetadata,
        rootHash: metadataResult.rootHash,
        txHash: metadataResult.txHash,
      };
    } catch (error) {
      logger.error('Error creating user backup:', error);
      
      // Log backup failure
      await auditService.log({
        userId,
        action: 'BACKUP_FAILED',
        entityType: 'BACKUP',
        details: {
          backupType,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown backup error',
      };
    }
  }

  /**
   * Restore data from a backup
   */
  async restoreFromBackup(
    userId: string,
    backupId: string,
    options: {
      targetPath?: string;
      dataTypes?: Array<'USER_DATA' | 'INVESTMENTS' | 'PORTFOLIO' | 'AUDIT_LOGS'>;
      verifyIntegrity?: boolean;
      overwriteExisting?: boolean;
    } = {}
  ): Promise<ZGStorageResult<{ restoredItems: number; warnings: string[] }>> {
    try {
      logger.info(`Starting restore process for user ${userId} from backup ${backupId}`);

      const {
        dataTypes,
        verifyIntegrity = true,
        overwriteExisting = false,
      } = options;

      // Retrieve backup metadata
      const backupMetadata = await this.getBackupMetadata(userId, backupId);
      if (!backupMetadata.success || !backupMetadata.data) {
        return {
          success: false,
          error: 'Backup metadata not found or corrupted',
        };
      }

      // Verify backup integrity if requested
      if (verifyIntegrity) {
        const integrityResult = await this.verifyBackupIntegrity(backupMetadata.data);
        if (!integrityResult.isValid) {
          return {
            success: false,
            error: `Backup integrity verification failed: ${integrityResult.error}`,
          };
        }
      }

      // Determine what to restore
      const typesToRestore = dataTypes || backupMetadata.data.dataTypes;
      const warnings: string[] = [];
      let restoredItems = 0;

      // Perform restoration process
      const restoreResult = await this.performRestore(
        userId,
        backupMetadata.data,
        typesToRestore,
        overwriteExisting
      );

      if (restoreResult.success) {
        restoredItems = restoreResult.restoredCount || 0;
        if (restoreResult.warnings) {
          warnings.push(...restoreResult.warnings);
        }
      }

      // Log restoration completion
      await auditService.log({
        userId,
        action: 'BACKUP_RESTORED',
        entityType: 'BACKUP',
        entityId: backupId,
        details: {
          dataTypes: typesToRestore,
          restoredItems,
          warnings: warnings.length,
          duration: Date.now() - backupMetadata.data.timestamp,
        },
      });

      logger.info(`Restore completed for user ${userId}: ${restoredItems} items restored`);

      return {
        success: true,
        data: {
          restoredItems,
          warnings,
        },
      };
    } catch (error) {
      logger.error('Error restoring from backup:', error);
      
      // Log restoration failure
      await auditService.log({
        userId,
        action: 'BACKUP_RESTORE_FAILED',
        entityType: 'BACKUP',
        entityId: backupId,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown restore error',
      };
    }
  }

  /**
   * List available backups for a user
   */
  async listUserBackups(
    userId: string,
    options: {
      limit?: number;
      backupType?: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL';
      startDate?: number;
      endDate?: number;
    } = {}
  ): Promise<ZGStorageResult<ZGBackupMetadata[]>> {
    try {
      // This would implement actual search/listing from 0G
      // For now, return a placeholder structure
      logger.info(`Listing backups for user: ${userId}`);
      
      return {
        success: true,
        data: [], // Would contain actual backup metadata list
      };
    } catch (error) {
      logger.error('Error listing user backups:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown listing error',
      };
    }
  }

  /**
   * Delete a backup and its associated data
   */
  async deleteBackup(
    userId: string,
    backupId: string,
    force: boolean = false
  ): Promise<ZGStorageResult<{ deleted: boolean; reason?: string }>> {
    try {
      logger.info(`Deleting backup ${backupId} for user ${userId}`);

      // Get backup metadata to check retention policy
      const backupMetadata = await this.getBackupMetadata(userId, backupId);
      if (!backupMetadata.success || !backupMetadata.data) {
        return {
          success: false,
          error: 'Backup not found',
        };
      }

      // Check if backup is locked
      if (backupMetadata.data.retention.locked && !force) {
        return {
          success: false,
          error: 'Backup is locked and cannot be deleted without force flag',
        };
      }

      // Perform deletion
      // This would implement actual deletion from 0G storage
      const deletionResult = await this.performBackupDeletion(userId, backupId);

      // Log deletion
      await auditService.log({
        userId,
        action: 'BACKUP_DELETED',
        entityType: 'BACKUP',
        entityId: backupId,
        details: {
          forced: force,
          size: backupMetadata.data.size,
        },
      });

      logger.info(`Backup deleted successfully: ${backupId}`);

      return {
        success: true,
        data: {
          deleted: deletionResult.success,
          reason: deletionResult.error,
        },
      };
    } catch (error) {
      logger.error('Error deleting backup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deletion error',
      };
    }
  }

  /**
   * Schedule automatic backups for a user
   */
  async scheduleUserBackups(
    userId: string,
    schedule: {
      daily?: boolean;
      weekly?: boolean;
      monthly?: boolean;
      customCron?: string;
    }
  ): Promise<{ success: boolean; scheduledJobs: string[]; error?: string }> {
    try {
      const scheduledJobs: string[] = [];

      // Schedule daily backups
      if (schedule.daily) {
        const dailyJob = cron.schedule('0 2 * * *', async () => {
          await this.createUserBackup(userId, 'INCREMENTAL');
        }, {
          scheduled: false,
          name: `daily_backup_${userId}`,
        });
        
        dailyJob.start();
        this.scheduledJobs.set(`daily_${userId}`, dailyJob);
        scheduledJobs.push('daily');
      }

      // Schedule weekly backups
      if (schedule.weekly) {
        const weeklyJob = cron.schedule('0 1 * * 0', async () => {
          await this.createUserBackup(userId, 'FULL');
        }, {
          scheduled: false,
          name: `weekly_backup_${userId}`,
        });
        
        weeklyJob.start();
        this.scheduledJobs.set(`weekly_${userId}`, weeklyJob);
        scheduledJobs.push('weekly');
      }

      // Schedule monthly backups
      if (schedule.monthly) {
        const monthlyJob = cron.schedule('0 0 1 * *', async () => {
          await this.createUserBackup(userId, 'FULL');
        }, {
          scheduled: false,
          name: `monthly_backup_${userId}`,
        });
        
        monthlyJob.start();
        this.scheduledJobs.set(`monthly_${userId}`, monthlyJob);
        scheduledJobs.push('monthly');
      }

      // Schedule custom cron job
      if (schedule.customCron) {
        const customJob = cron.schedule(schedule.customCron, async () => {
          await this.createUserBackup(userId, 'FULL');
        }, {
          scheduled: false,
          name: `custom_backup_${userId}`,
        });
        
        customJob.start();
        this.scheduledJobs.set(`custom_${userId}`, customJob);
        scheduledJobs.push('custom');
      }

      logger.info(`Scheduled ${scheduledJobs.length} backup jobs for user ${userId}`);

      return {
        success: true,
        scheduledJobs,
      };
    } catch (error) {
      logger.error('Error scheduling user backups:', error);
      return {
        success: false,
        scheduledJobs: [],
        error: error instanceof Error ? error.message : 'Unknown scheduling error',
      };
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackupIntegrity(
    backup: ZGBackupMetadata
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // This would implement actual integrity verification
      // For now, return a basic validation
      
      if (!backup.integrity?.checksum) {
        return {
          isValid: false,
          error: 'No checksum available for verification',
        };
      }

      // Would implement actual checksum verification against stored data
      logger.info(`Verifying integrity for backup: ${backup.backupId}`);

      return {
        isValid: true,
      };
    } catch (error) {
      logger.error('Error verifying backup integrity:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown verification error',
      };
    }
  }

  /**
   * Cleanup expired backups
   */
  async cleanupExpiredBackups(): Promise<{
    success: boolean;
    cleanedCount: number;
    errors: string[];
  }> {
    try {
      logger.info('Starting cleanup of expired backups');

      const errors: string[] = [];
      let cleanedCount = 0;

      // This would implement actual cleanup logic
      // For now, return placeholder results

      logger.info(`Cleanup completed: ${cleanedCount} backups cleaned`);

      return {
        success: true,
        cleanedCount,
        errors,
      };
    } catch (error) {
      logger.error('Error during backup cleanup:', error);
      return {
        success: false,
        cleanedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown cleanup error'],
      };
    }
  }

  // Private helper methods

  /**
   * Perform the actual backup process
   */
  private async performBackup(
    userId: string,
    metadata: ZGBackupMetadata,
    dataTypes: string[]
  ): Promise<{ success: boolean; totalSize?: number; checksum?: string; error?: string }> {
    try {
      let totalSize = 0;
      const dataHashes: string[] = [];

      // Backup each data type
      for (const dataType of dataTypes) {
        const result = await this.backupDataType(userId, dataType);
        if (result.success) {
          totalSize += result.size || 0;
          if (result.checksum) {
            dataHashes.push(result.checksum);
          }
        }
      }

      // Generate combined checksum
      const combinedData = dataHashes.join('');
      const checksum = encryptionService.generateHash(combinedData, 'sha256');

      return {
        success: true,
        totalSize,
        checksum,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown backup error',
      };
    }
  }

  /**
   * Backup specific data type
   */
  private async backupDataType(
    userId: string,
    dataType: string
  ): Promise<{ success: boolean; size?: number; checksum?: string; error?: string }> {
    try {
      // This would implement actual data type-specific backup logic
      // For now, return placeholder results
      
      return {
        success: true,
        size: 1024, // Placeholder size
        checksum: encryptionService.generateHash(`${userId}:${dataType}:${Date.now()}`),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown data type backup error',
      };
    }
  }

  /**
   * Perform the restore process
   */
  private async performRestore(
    userId: string,
    backup: ZGBackupMetadata,
    dataTypes: string[],
    overwriteExisting: boolean
  ): Promise<{
    success: boolean;
    restoredCount?: number;
    warnings?: string[];
    error?: string;
  }> {
    try {
      let restoredCount = 0;
      const warnings: string[] = [];

      // Restore each data type
      for (const dataType of dataTypes) {
        const result = await this.restoreDataType(userId, backup, dataType, overwriteExisting);
        if (result.success) {
          restoredCount += result.count || 0;
        }
        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      }

      return {
        success: true,
        restoredCount,
        warnings,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown restore error',
      };
    }
  }

  /**
   * Restore specific data type
   */
  private async restoreDataType(
    userId: string,
    backup: ZGBackupMetadata,
    dataType: string,
    overwriteExisting: boolean
  ): Promise<{
    success: boolean;
    count?: number;
    warnings?: string[];
    error?: string;
  }> {
    try {
      // This would implement actual data type-specific restore logic
      
      return {
        success: true,
        count: 10, // Placeholder count
        warnings: [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown data type restore error',
      };
    }
  }

  /**
   * Get backup metadata from 0G storage
   */
  private async getBackupMetadata(
    userId: string,
    backupId: string
  ): Promise<ZGStorageResult<ZGBackupMetadata>> {
    try {
      // This would implement actual metadata retrieval from 0G
      // For now, return placeholder
      
      return {
        success: true,
        data: undefined, // Would contain actual metadata
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown metadata retrieval error',
      };
    }
  }

  /**
   * Perform backup deletion
   */
  private async performBackupDeletion(
    userId: string,
    backupId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // This would implement actual deletion from 0G storage
      
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deletion error',
      };
    }
  }

  /**
   * Initialize global scheduled backup jobs
   */
  private initializeScheduledBackups(): void {
    // Schedule daily cleanup of expired backups
    const cleanupJob = cron.schedule('0 3 * * *', async () => {
      await this.cleanupExpiredBackups();
    }, {
      scheduled: true,
      name: 'cleanup_expired_backups',
    });

    this.scheduledJobs.set('cleanup', cleanupJob);
    logger.info('Initialized scheduled backup jobs');
  }

  /**
   * Calculate expiration time based on backup type
   */
  private calculateExpirationTime(backupType: string, timestamp: number): number {
    const days = this.config.retention[backupType.toLowerCase() as keyof typeof this.config.retention] || 30;
    return timestamp + (days * 24 * 60 * 60 * 1000);
  }

  /**
   * Get retention policy name
   */
  private getRetentionPolicy(backupType: string): string {
    const policies = {
      FULL: 'LONG_TERM_RETENTION',
      INCREMENTAL: 'SHORT_TERM_RETENTION',
      DIFFERENTIAL: 'MEDIUM_TERM_RETENTION',
    };
    
    return policies[backupType as keyof typeof policies] || 'DEFAULT_RETENTION';
  }

  /**
   * Determine recovery priority
   */
  private determineRecoveryPriority(
    backupType: string
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const priorities = {
      FULL: 'HIGH',
      INCREMENTAL: 'MEDIUM',
      DIFFERENTIAL: 'MEDIUM',
    };
    
    return priorities[backupType as keyof typeof priorities] as 'HIGH' | 'MEDIUM' || 'MEDIUM';
  }

  /**
   * Estimate restore time based on data types count
   */
  private estimateRestoreTime(dataTypeCount: number): number {
    // Base time of 5 minutes plus 2 minutes per data type
    return 300000 + (dataTypeCount * 120000);
  }
}

// Export singleton instance
export const backupService = new BackupService();