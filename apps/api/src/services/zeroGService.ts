import { Indexer, ZgFile, Batcher, KvClient, getFlowContract } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { encryptionService } from './encryption.service';
import { logger } from './logger.service';
import {
  ZGUserData,
  ZGInvestmentRecord,
  ZGPortfolioSnapshot,
  ZGAnalyticsReport,
  ZGBackupMetadata,
  ZGStorageResult,
  ZGSearchQuery,
  ZGSyncStatus,
  ZGServiceConfig,
  ZGSchemas
} from '../types/zeroG.types';

// Load environment variables
dotenv.config();

// 0G Network Configuration
const ZG_CONFIG = {
  evmRpc: process.env.ZG_EVM_RPC || 'https://evmrpc-testnet.0g.ai',
  indexerRpc: process.env.ZG_INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
  kvClientAddr: process.env.ZG_KV_CLIENT_ADDR || 'http://3.101.147.150:6789',
  privateKey: process.env.ZG_PRIVATE_KEY || '',
  flowContractAddress: process.env.ZG_FLOW_CONTRACT_ADDRESS || ''
};

// Validate configuration
if (!ZG_CONFIG.privateKey) {
  console.warn('ZG_PRIVATE_KEY not set. 0G storage operations will be limited.');
}

/**
 * Enhanced 0G Network Service for decentralized storage, AI inference, and portfolio management
 * Provides secure, scalable storage for user data, investment records, and portfolio history
 */
export class ZeroGService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  private indexer: Indexer;
  private kvClient: KvClient;
  private flowContract: any;
  
  // Stream IDs for different data types
  private readonly streamIds = {
    users: 'user_data',
    investments: 'investment_records',
    portfolios: 'portfolio_snapshots',
    analytics: 'analytics_reports',
    backups: 'backup_metadata'
  };

  // Configuration for enhanced features
  private readonly config: ZGServiceConfig = {
    encryption: {
      algorithm: 'aes-256-gcm',
      keyDerivation: 'pbkdf2',
      saltLength: 32,
      ivLength: 16,
    },
    storage: {
      defaultStreamId: 'stack_default',
      maxFileSize: 100 * 1024 * 1024, // 100MB
      compressionEnabled: true,
      redundancyLevel: 3,
    },
    sync: {
      batchSize: 100,
      retryAttempts: 3,
      retryDelay: 1000,
      conflictResolution: 'REMOTE',
    },
    audit: {
      enabled: true,
      level: 'COMPREHENSIVE',
      retentionDays: 2555, // 7 years
    },
  };

  constructor() {
    this.provider = new ethers.JsonRpcProvider(ZG_CONFIG.evmRpc);
    
    if (ZG_CONFIG.privateKey) {
      this.signer = new ethers.Wallet(ZG_CONFIG.privateKey, this.provider);
    }
    
    this.indexer = new Indexer(ZG_CONFIG.indexerRpc);
    this.kvClient = new KvClient(ZG_CONFIG.kvClientAddr);
    
    // Initialize flow contract if address is provided
    if (ZG_CONFIG.flowContractAddress) {
      this.flowContract = getFlowContract(ZG_CONFIG.flowContractAddress, this.signer || this.provider);
    }
  }

  /**
   * Upload file to 0G decentralized storage
   */
  async uploadFile(filePath: string): Promise<{ success: boolean; rootHash?: string; txHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('Signer not available. Please set ZG_PRIVATE_KEY.');
      }

      const file = await ZgFile.fromFilePath(filePath);
      const [tree, treeErr] = await file.merkleTree();
      
      if (treeErr) {
        await file.close();
        throw new Error(`Failed to create merkle tree: ${treeErr}`);
      }

      const rootHash = tree.rootHash();
      console.log('File Root Hash:', rootHash);

      // Upload to 0G storage
      const [tx, uploadErr] = await this.indexer.upload(file, ZG_CONFIG.evmRpc, this.signer);
      
      await file.close();
      
      if (uploadErr) {
        throw new Error(`Upload failed: ${uploadErr}`);
      }

      return {
        success: true,
        rootHash,
        txHash: tx
      };
    } catch (error) {
      console.error('0G file upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  /**
   * Upload data from buffer to 0G storage
   */
  async uploadBuffer(buffer: Buffer, filename: string): Promise<{ success: boolean; rootHash?: string; txHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('Signer not available. Please set ZG_PRIVATE_KEY.');
      }

      // Create temporary file from buffer
      const tempPath = `/tmp/${filename}_${Date.now()}`;
      const fs = await import('fs');
      fs.writeFileSync(tempPath, buffer);

      const result = await this.uploadFile(tempPath);
      
      // Clean up temporary file
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }

      return result;
    } catch (error) {
      console.error('0G buffer upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown buffer upload error'
      };
    }
  }

  /**
   * Download file from 0G storage
   */
  async downloadFile(rootHash: string, outputPath: string, withProof: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      const err = await this.indexer.download(rootHash, outputPath, withProof);
      
      if (err) {
        throw new Error(`Download failed: ${err}`);
      }

      return { success: true };
    } catch (error) {
      console.error('0G file download error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown download error'
      };
    }
  }

  /**
   * Store key-value data in 0G KV store
   */
  async storeKeyValue(streamId: string, key: string, value: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer || !this.flowContract) {
        throw new Error('Signer and flow contract required for KV operations.');
      }

      const [nodes, nodesErr] = await this.indexer.selectNodes(1);
      if (nodesErr) {
        throw new Error(`Failed to select nodes: ${nodesErr}`);
      }

      const batcher = new Batcher(1, nodes, this.flowContract, ZG_CONFIG.evmRpc);
      
      const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
      const valueBytes = Uint8Array.from(Buffer.from(value, 'utf-8'));
      
      batcher.streamDataBuilder.set(streamId, keyBytes, valueBytes);
      
      const [tx, execErr] = await batcher.exec();
      
      if (execErr) {
        throw new Error(`Batcher execution failed: ${execErr}`);
      }

      return {
        success: true,
        txHash: tx
      };
    } catch (error) {
      console.error('0G KV store error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown KV store error'
      };
    }
  }

  /**
   * Retrieve value from 0G KV store
   */
  async getValue(streamId: string, key: string): Promise<{ success: boolean; value?: string; error?: string }> {
    try {
      const encodedKey = ethers.encodeBase64(Buffer.from(key, 'utf-8'));
      const value = await this.kvClient.getValue(streamId, encodedKey);
      
      return {
        success: true,
        value: value || undefined
      };
    } catch (error) {
      console.error('0G KV get error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown KV get error'
      };
    }
  }

  /**
   * Store basket metadata in 0G storage
   */
  async storeBasketMetadata(basketId: string, metadata: any): Promise<{ success: boolean; rootHash?: string; error?: string }> {
    try {
      const metadataJson = JSON.stringify(metadata, null, 2);
      const buffer = Buffer.from(metadataJson, 'utf-8');
      
      const result = await this.uploadBuffer(buffer, `basket_${basketId}_metadata.json`);
      
      if (result.success && result.rootHash) {
        // Also store in KV for quick access
        await this.storeKeyValue('baskets', `metadata_${basketId}`, result.rootHash);
      }
      
      return result;
    } catch (error) {
      console.error('0G basket metadata store error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown metadata store error'
      };
    }
  }

  /**
   * Retrieve basket metadata from 0G storage
   */
  async getBasketMetadata(basketId: string): Promise<{ success: boolean; metadata?: any; error?: string }> {
    try {
      // First try to get from KV store
      const kvResult = await this.getValue('baskets', `metadata_${basketId}`);
      
      if (!kvResult.success || !kvResult.value) {
        return {
          success: false,
          error: 'Basket metadata not found in 0G storage'
        };
      }
      
      // Download the actual metadata file
      const tempPath = `/tmp/basket_${basketId}_${Date.now()}.json`;
      const downloadResult = await this.downloadFile(kvResult.value, tempPath);
      
      if (!downloadResult.success) {
        return {
          success: false,
          error: downloadResult.error
        };
      }
      
      // Read and parse the metadata
      const fs = await import('fs');
      const metadataJson = fs.readFileSync(tempPath, 'utf-8');
      const metadata = JSON.parse(metadataJson);
      
      // Clean up temp file
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp metadata file:', cleanupError);
      }
      
      return {
        success: true,
        metadata
      };
    } catch (error) {
      console.error('0G basket metadata get error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown metadata get error'
      };
    }
  }

  /**
   * Store user data securely in 0G storage
   */
  async storeUserData(userData: ZGUserData): Promise<ZGStorageResult<ZGUserData>> {
    try {
      // Validate user data structure
      const validationResult = ZGSchemas.UserData.safeParse(userData);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Invalid user data structure',
        };
      }

      // Encrypt PII data
      const encryptedData = await encryptionService.encryptPII(
        userData,
        userData.userId
      );

      // Store in 0G KV store
      const key = `user:${userData.userId}:${Date.now()}`;
      const result = await this.storeKeyValue(
        this.streamIds.users,
        key,
        encryptedData
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      logger.info(`User data stored in 0G: ${userData.userId}`);

      return {
        success: true,
        data: userData,
        rootHash: result.rootHash,
        txHash: result.txHash,
      };
    } catch (error) {
      logger.error('Error storing user data in 0G:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown storage error',
      };
    }
  }

  /**
   * Retrieve user data from 0G storage
   */
  async getUserData(userId: string): Promise<ZGStorageResult<ZGUserData>> {
    try {
      // This would require implementing a search mechanism in 0G
      // For now, we'll return a placeholder
      logger.info(`Retrieving user data for: ${userId}`);
      
      // Implementation would depend on 0G search capabilities
      return {
        success: true,
        data: undefined, // Would contain decrypted user data
      };
    } catch (error) {
      logger.error('Error retrieving user data from 0G:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown retrieval error',
      };
    }
  }

  /**
   * Store investment record in 0G storage
   */
  async storeInvestmentRecord(record: ZGInvestmentRecord): Promise<ZGStorageResult<ZGInvestmentRecord>> {
    try {
      // Validate investment record structure
      const validationResult = ZGSchemas.InvestmentRecord.safeParse(record);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Invalid investment record structure',
        };
      }

      // Encrypt financial data
      const encryptedData = await encryptionService.encryptFinancialData(
        record,
        record.userId
      );

      // Store with compliance metadata
      const key = `investment:${record.userId}:${record.id}:${record.execution.timestamp}`;
      const result = await this.storeKeyValue(
        this.streamIds.investments,
        key,
        encryptedData
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      logger.info(`Investment record stored in 0G: ${record.id}`);

      return {
        success: true,
        data: record,
        rootHash: result.rootHash,
        txHash: result.txHash,
      };
    } catch (error) {
      logger.error('Error storing investment record in 0G:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown storage error',
      };
    }
  }

  /**
   * Store portfolio snapshot in 0G storage
   */
  async storePortfolioSnapshot(snapshot: ZGPortfolioSnapshot): Promise<ZGStorageResult<ZGPortfolioSnapshot>> {
    try {
      // Validate portfolio snapshot structure
      const validationResult = ZGSchemas.PortfolioSnapshot.safeParse(snapshot);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Invalid portfolio snapshot structure',
        };
      }

      // Encrypt portfolio data
      const encryptedData = await encryptionService.encryptFinancialData(
        snapshot,
        snapshot.userId
      );

      // Store with timestamp for historical tracking
      const key = `portfolio:${snapshot.userId}:${snapshot.portfolioId}:${snapshot.timestamp}`;
      const result = await this.storeKeyValue(
        this.streamIds.portfolios,
        key,
        encryptedData
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      logger.info(`Portfolio snapshot stored in 0G: ${snapshot.portfolioId}`);

      return {
        success: true,
        data: snapshot,
        rootHash: result.rootHash,
        txHash: result.txHash,
      };
    } catch (error) {
      logger.error('Error storing portfolio snapshot in 0G:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown storage error',
      };
    }
  }

  /**
   * Store analytics report in 0G storage
   */
  async storeAnalyticsReport(report: ZGAnalyticsReport): Promise<ZGStorageResult<ZGAnalyticsReport>> {
    try {
      // Validate analytics report structure
      const validationResult = ZGSchemas.AnalyticsReport.safeParse(report);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Invalid analytics report structure',
        };
      }

      // Encrypt report data
      const encryptedData = await encryptionService.encryptJSON(
        report,
        `analytics:${report.userId}`
      );

      // Store with expiration handling
      const key = `analytics:${report.userId}:${report.type}:${report.generated_at}`;
      const result = await this.storeKeyValue(
        this.streamIds.analytics,
        key,
        encryptedData
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      logger.info(`Analytics report stored in 0G: ${report.reportId}`);

      return {
        success: true,
        data: report,
        rootHash: result.rootHash,
        txHash: result.txHash,
      };
    } catch (error) {
      logger.error('Error storing analytics report in 0G:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown storage error',
      };
    }
  }

  /**
   * Batch store multiple records for efficiency
   */
  async batchStore(records: Array<{
    type: 'user' | 'investment' | 'portfolio' | 'analytics';
    data: any;
  }>): Promise<ZGStorageResult<Array<{ success: boolean; id?: string; error?: string }>>> {
    try {
      const results: Array<{ success: boolean; id?: string; error?: string }> = [];
      
      for (const record of records) {
        let result: ZGStorageResult<any>;
        
        switch (record.type) {
          case 'user':
            result = await this.storeUserData(record.data);
            break;
          case 'investment':
            result = await this.storeInvestmentRecord(record.data);
            break;
          case 'portfolio':
            result = await this.storePortfolioSnapshot(record.data);
            break;
          case 'analytics':
            result = await this.storeAnalyticsReport(record.data);
            break;
          default:
            result = { success: false, error: 'Unknown record type' };
        }
        
        results.push({
          success: result.success,
          id: result.data?.id || record.data.id,
          error: result.error,
        });
      }
      
      const successCount = results.filter(r => r.success).length;
      logger.info(`Batch store completed: ${successCount}/${records.length} successful`);
      
      return {
        success: true,
        data: results,
      };
    } catch (error) {
      logger.error('Error in batch store operation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown batch store error',
      };
    }
  }

  /**
   * Search and retrieve data with filtering
   */
  async searchData(query: ZGSearchQuery): Promise<ZGStorageResult<any[]>> {
    try {
      // This would implement actual search functionality
      // For now, return a placeholder structure
      logger.info('Searching 0G data with query:', query);
      
      return {
        success: true,
        data: [], // Would contain actual search results
      };
    } catch (error) {
      logger.error('Error searching 0G data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown search error',
      };
    }
  }

  /**
   * Generate backup of user data
   */
  async createBackup(
    userId: string,
    dataTypes: Array<'USER_DATA' | 'INVESTMENTS' | 'PORTFOLIO' | 'AUDIT_LOGS'>
  ): Promise<ZGStorageResult<ZGBackupMetadata>> {
    try {
      const backupId = uuidv4();
      const timestamp = Date.now();
      
      const backupMetadata: ZGBackupMetadata = {
        backupId,
        userId,
        type: 'FULL',
        timestamp,
        dataTypes,
        size: 0, // Would be calculated
        compression: true,
        encryption: {
          algorithm: this.config.encryption.algorithm,
          keyId: `backup:${userId}:${timestamp}`,
          iv: encryptionService.generateSecureId(16),
        },
        integrity: {
          checksum: '',
          algorithm: 'SHA256',
        },
        retention: {
          expiresAt: timestamp + (365 * 24 * 60 * 60 * 1000), // 1 year
          policy: 'ANNUAL_RETENTION',
          locked: false,
        },
        recovery: {
          priority: 'MEDIUM',
          estimatedRestoreTime: 300000, // 5 minutes
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

      // Store backup metadata
      const encryptedMetadata = await encryptionService.encryptJSON(
        backupMetadata,
        `backup:${userId}`
      );

      const key = `backup:${userId}:${backupId}:${timestamp}`;
      const result = await this.storeKeyValue(
        this.streamIds.backups,
        key,
        encryptedMetadata
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      logger.info(`Backup created for user ${userId}: ${backupId}`);

      return {
        success: true,
        data: backupMetadata,
        rootHash: result.rootHash,
        txHash: result.txHash,
      };
    } catch (error) {
      logger.error('Error creating backup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown backup error',
      };
    }
  }

  /**
   * Get sync status for data consistency
   */
  async getSyncStatus(userId: string): Promise<ZGStorageResult<ZGSyncStatus>> {
    try {
      // This would implement actual sync status checking
      const syncStatus: ZGSyncStatus = {
        lastSync: Date.now() - (24 * 60 * 60 * 1000), // 24 hours ago
        status: 'SYNCED',
        metrics: {
          totalRecords: 0,
          syncedRecords: 0,
          failedRecords: 0,
          lastSyncDuration: 30000, // 30 seconds
        },
      };
      
      return {
        success: true,
        data: syncStatus,
      };
    } catch (error) {
      logger.error('Error getting sync status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync status error',
      };
    }
  }

  /**
   * Enhanced error handling with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = this.config.sync.retryAttempts,
    delay: number = this.config.sync.retryDelay
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        logger.warn(`Operation failed (attempt ${attempt}/${maxAttempts}):`, error);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  }

  /**
   * Get network status and health
   */
  async getNetworkStatus(): Promise<{ success: boolean; status?: any; error?: string }> {
    try {
      // Check provider connection
      const blockNumber = await this.provider.getBlockNumber();
      
      const status = {
        connected: true,
        blockNumber,
        network: await this.provider.getNetwork(),
        signerAvailable: !!this.signer,
        flowContractAvailable: !!this.flowContract,
        timestamp: new Date().toISOString(),
        config: {
          streamsConfigured: Object.keys(this.streamIds).length,
          encryptionEnabled: true,
          auditEnabled: this.config.audit.enabled,
        },
      };
      
      return {
        success: true,
        status
      };
    } catch (error) {
      logger.error('0G network status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown network status error'
      };
    }
  }
}

// Export singleton instance
export const zeroGService = new ZeroGService();

// Export types for use in other modules
export interface ZGUploadResult {
  success: boolean;
  rootHash?: string;
  txHash?: string;
  error?: string;
}

export interface ZGDownloadResult {
  success: boolean;
  error?: string;
}

export interface ZGKVResult {
  success: boolean;
  value?: string;
  txHash?: string;
  error?: string;
}