import { prisma } from '@stack/database';
import { ContextualLogger, createLogger } from './logger.service';
import { AuditStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { zeroGService } from './zeroGService';
import { encryptionService } from './encryption.service';
import { ZGAuditLog, ZGAuditLogSchema, ZGStorageResult } from '../types/zeroG.types';

export interface AuditLogData {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  correlationId?: string;
  status?: AuditStatus;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  private logger: ContextualLogger;
  private readonly auditStreamId = 'audit_logs';
  private readonly complianceStreamId = 'compliance_logs';
  private readonly securityStreamId = 'security_logs';
  private readonly enable0GStorage = process.env.ENABLE_0G_AUDIT_STORAGE === 'true';

  constructor(correlationId?: string) {
    this.logger = createLogger({ 
      correlationId,
      service: 'AuditService' 
    });
  }

  /**
   * Log an audit event to both database, structured logs, and 0G storage
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      // Log to database for compliance and historical tracking
      const auditLog = await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          details: data.details || {},
          correlationId: data.correlationId,
          status: data.status || AuditStatus.SUCCESS,
          errorMessage: data.errorMessage,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      // Log to 0G storage for decentralized audit trail
      if (this.enable0GStorage && data.userId) {
        await this.store0GAuditLog(auditLog, data);
      }

      // Log to structured logs for monitoring and alerting
      this.logger.audit(data.action, data.status === AuditStatus.FAILURE ? 'FAILURE' : 'SUCCESS', {
        userId: data.userId,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details,
        errorMessage: data.errorMessage,
      });

      // Increment metrics
      this.logger.metric('audit_logs_total', 1, {
        action: data.action,
        status: data.status || 'SUCCESS',
        entityType: data.entityType || 'unknown',
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error, data);
      // Don't throw - audit failures shouldn't break business logic
    }
  }

  /**
   * Log successful wallet creation
   */
  async logWalletCreation(data: {
    userId: string;
    walletId: string;
    chain: string;
    address: string;
    turnkeyWalletId: string;
    turnkeyAccountId: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      userId: data.userId,
      action: 'WALLET_CREATION',
      entityType: 'WALLET',
      entityId: data.walletId,
      details: {
        chain: data.chain,
        address: data.address,
        turnkeyWalletId: data.turnkeyWalletId,
        turnkeyAccountId: data.turnkeyAccountId,
      },
      correlationId: data.correlationId,
      status: AuditStatus.SUCCESS,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  /**
   * Log failed wallet creation
   */
  async logWalletCreationFailure(data: {
    userId: string;
    chain: string;
    error: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, any>;
  }): Promise<void> {
    await this.log({
      userId: data.userId,
      action: 'WALLET_CREATION',
      entityType: 'WALLET',
      details: {
        chain: data.chain,
        ...data.details,
      },
      correlationId: data.correlationId,
      status: AuditStatus.FAILURE,
      errorMessage: data.error,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  /**
   * Log user onboarding start
   */
  async logOnboardingStart(data: {
    userId: string;
    emailOrPhone: string;
    referralCode?: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      userId: data.userId,
      action: 'ONBOARDING_START',
      entityType: 'USER',
      entityId: data.userId,
      details: {
        emailOrPhone: data.emailOrPhone,
        referralCode: data.referralCode,
        hasReferral: !!data.referralCode,
      },
      correlationId: data.correlationId,
      status: AuditStatus.SUCCESS,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  /**
   * Log KYC status update
   */
  async logKYCUpdate(data: {
    userId: string;
    oldStatus: string;
    newStatus: string;
    providerId?: string;
    correlationId?: string;
    details?: Record<string, any>;
  }): Promise<void> {
    await this.log({
      userId: data.userId,
      action: 'KYC_STATUS_UPDATE',
      entityType: 'USER',
      entityId: data.userId,
      details: {
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        providerId: data.providerId,
        ...data.details,
      },
      correlationId: data.correlationId,
      status: AuditStatus.SUCCESS,
    });
  }

  /**
   * Log authentication events
   */
  async logAuthentication(data: {
    userId?: string;
    action: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'TOKEN_REFRESH' | 'LOGOUT';
    email?: string;
    errorMessage?: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      userId: data.userId,
      action: data.action,
      entityType: 'USER',
      entityId: data.userId,
      details: {
        email: data.email,
      },
      correlationId: data.correlationId,
      status: data.action.includes('FAILURE') ? AuditStatus.FAILURE : AuditStatus.SUCCESS,
      errorMessage: data.errorMessage,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  /**
   * Query audit logs for a specific user
   */
  async getUserAuditLogs(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      actions?: string[];
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<any[]> {
    const { limit = 100, offset = 0, actions, startDate, endDate } = options;

    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          userId,
          ...(actions && { action: { in: actions } }),
          ...(startDate && endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return logs;
    } catch (error) {
      this.logger.error('Failed to query user audit logs', error, { userId, options });
      throw error;
    }
  }

  /**
   * Get audit statistics for monitoring
   */
  async getAuditStats(
    options: {
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<{
    totalLogs: number;
    successRate: number;
    actionBreakdown: Record<string, number>;
    entityTypeBreakdown: Record<string, number>;
  }> {
    try {
      const { startDate = new Date(Date.now() - 24 * 60 * 60 * 1000), endDate = new Date() } = options;

      const [totalLogs, actionStats, entityStats] = await Promise.all([
        prisma.auditLog.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        prisma.auditLog.groupBy({
          by: ['action', 'status'],
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _count: true,
        }),
        prisma.auditLog.groupBy({
          by: ['entityType'],
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            entityType: {
              not: null,
            },
          },
          _count: true,
        }),
      ]);

      const successCount = actionStats
        .filter(stat => stat.status === AuditStatus.SUCCESS)
        .reduce((sum, stat) => sum + stat._count, 0);

      const successRate = totalLogs > 0 ? (successCount / totalLogs) * 100 : 0;

      const actionBreakdown = actionStats.reduce((acc, stat) => {
        acc[stat.action] = (acc[stat.action] || 0) + stat._count;
        return acc;
      }, {} as Record<string, number>);

      const entityTypeBreakdown = entityStats.reduce((acc, stat) => {
        if (stat.entityType) {
          acc[stat.entityType] = stat._count;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        totalLogs,
        successRate: Math.round(successRate * 100) / 100,
        actionBreakdown,
        entityTypeBreakdown,
      };
    } catch (error) {
      this.logger.error('Failed to get audit stats', error);
      throw error;
    }
  }

  /**
   * Store audit log in 0G decentralized storage
   */
  private async store0GAuditLog(auditLog: any, data: AuditLogData): Promise<void> {
    try {
      if (!data.userId) return;

      const zgAuditLog: ZGAuditLog = {
        id: auditLog.id,
        userId: data.userId,
        action: data.action,
        resource: data.entityType || 'UNKNOWN',
        resourceId: data.entityId,
        timestamp: auditLog.createdAt.getTime(),
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        sessionId: data.correlationId,
        changes: data.details ? { after: data.details } : undefined,
        compliance: {
          regulation: this.getApplicableRegulations(data.entityType || '', data.action),
          retention_period: this.getRetentionPeriod(data.entityType || ''),
          classification: this.classifyDataSensitivity(data.entityType || '', data.details),
        },
        metadata: {
          severity: this.determineSeverity(data.action, data.status),
          category: this.determineCategory(data.action, data.entityType),
          automated: false,
        },
      };

      // Validate and encrypt the audit log
      const validationResult = ZGAuditLogSchema.safeParse(zgAuditLog);
      if (!validationResult.success) {
        this.logger.warn('0G Audit log validation failed:', validationResult.error);
        return;
      }

      const encryptedData = await encryptionService.encryptJSON(
        zgAuditLog,
        `audit:${data.userId}`
      );

      // Store in appropriate stream
      const streamId = this.getStreamIdByCategory(zgAuditLog.metadata.category);
      const key = `${data.userId}:${auditLog.id}:${zgAuditLog.timestamp}`;

      const result = await zeroGService.storeKeyValue(
        streamId,
        key,
        encryptedData
      );

      if (result.success) {
        this.logger.info(`Audit log stored in 0G storage: ${auditLog.id}`);
      } else {
        this.logger.warn(`Failed to store audit log in 0G: ${result.error}`);
      }
    } catch (error) {
      this.logger.warn('Error storing audit log in 0G:', error);
    }
  }

  /**
   * Enhanced audit logging with 0G compliance features
   */
  async logComplianceEvent(
    userId: string,
    regulation: string,
    action: string,
    status: 'PASSED' | 'FAILED' | 'WARNING',
    details?: Record<string, unknown>
  ): Promise<ZGStorageResult<ZGAuditLog>> {
    const auditLog: ZGAuditLog = {
      id: uuidv4(),
      userId,
      action: `COMPLIANCE_${status}`,
      resource: 'COMPLIANCE_CHECK',
      resourceId: regulation,
      timestamp: Date.now(),
      compliance: {
        regulation: [regulation],
        retention_period: this.getComplianceRetentionPeriod(regulation),
        classification: 'CONFIDENTIAL',
      },
      metadata: {
        severity: status === 'FAILED' ? 'HIGH' : status === 'WARNING' ? 'MEDIUM' : 'LOW',
        category: 'COMPLIANCE',
        automated: true,
      },
    };

    if (details) {
      auditLog.changes = { after: details };
    }

    // Store in 0G and local database
    if (this.enable0GStorage) {
      try {
        const encryptedData = await encryptionService.encryptJSON(
          auditLog,
          `compliance:${userId}`
        );

        const key = `${userId}:${regulation}:${auditLog.timestamp}`;
        const result = await zeroGService.storeKeyValue(
          this.complianceStreamId,
          key,
          encryptedData
        );

        if (result.success) {
          // Also log to local database for immediate access
          await this.log({
            userId,
            action: auditLog.action,
            entityType: 'COMPLIANCE',
            entityId: regulation,
            details: details || {},
            status: status === 'PASSED' ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
          });
        }

        return {
          success: result.success,
          data: result.success ? auditLog : undefined,
          error: result.error,
          rootHash: result.rootHash,
          txHash: result.txHash,
        };
      } catch (error) {
        this.logger.error('Error logging compliance event to 0G:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown compliance logging error',
        };
      }
    }

    // Fallback to local logging only
    await this.log({
      userId,
      action: auditLog.action,
      entityType: 'COMPLIANCE',
      entityId: regulation,
      details: details || {},
      status: status === 'PASSED' ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
    });

    return {
      success: true,
      data: auditLog,
    };
  }

  /**
   * Log security events with enhanced 0G storage
   */
  async logSecurityEvent(
    userId: string,
    action: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    details: Record<string, unknown>,
    metadata: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
    } = {}
  ): Promise<ZGStorageResult<ZGAuditLog>> {
    const auditLog: ZGAuditLog = {
      id: uuidv4(),
      userId,
      action: `SECURITY_${action}`,
      resource: 'SECURITY_EVENT',
      timestamp: Date.now(),
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      sessionId: metadata.sessionId,
      changes: { after: details },
      compliance: {
        regulation: ['SOX', 'PCI_DSS'],
        retention_period: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
        classification: 'RESTRICTED',
      },
      metadata: {
        severity,
        category: 'SECURITY',
        automated: true,
      },
    };

    // Store in both 0G and local database
    if (this.enable0GStorage) {
      try {
        const encryptedData = await encryptionService.encryptJSON(
          auditLog,
          `security:${userId}`
        );

        const key = `${userId}:${action}:${auditLog.timestamp}`;
        const result = await zeroGService.storeKeyValue(
          this.securityStreamId,
          key,
          encryptedData
        );

        // For critical security events, also trigger immediate backup
        if (severity === 'CRITICAL') {
          await this.triggerEmergencyBackup(auditLog);
        }

        // Log to local database as well
        await this.log({
          userId,
          action: auditLog.action,
          entityType: 'SECURITY',
          details,
          status: AuditStatus.SUCCESS,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          correlationId: metadata.sessionId,
        });

        return {
          success: result.success,
          data: result.success ? auditLog : undefined,
          error: result.error,
          rootHash: result.rootHash,
          txHash: result.txHash,
        };
      } catch (error) {
        this.logger.error('Error logging security event to 0G:', error);
      }
    }

    // Fallback to local logging
    await this.log({
      userId,
      action: `SECURITY_${action}`,
      entityType: 'SECURITY',
      details,
      status: AuditStatus.SUCCESS,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      correlationId: metadata.sessionId,
    });

    return {
      success: true,
      data: auditLog,
    };
  }

  // Helper methods for 0G audit logging
  private getApplicableRegulations(entityType: string, action: string): string[] {
    const regulations: string[] = [];

    if (entityType?.toLowerCase().includes('transaction') || 
        entityType?.toLowerCase().includes('payment') ||
        entityType?.toLowerCase().includes('financial')) {
      regulations.push('SOX', 'PCI_DSS');
    }

    if (entityType?.toLowerCase().includes('user') ||
        entityType?.toLowerCase().includes('profile') ||
        action?.toLowerCase().includes('pii')) {
      regulations.push('GDPR', 'CCPA');
    }

    if (entityType?.toLowerCase().includes('investment') ||
        entityType?.toLowerCase().includes('portfolio') ||
        entityType?.toLowerCase().includes('trade')) {
      regulations.push('SEC', 'FINRA');
    }

    return regulations.length > 0 ? regulations : ['GENERAL'];
  }

  private getRetentionPeriod(entityType: string): number {
    const defaultRetention = 7 * 365 * 24 * 60 * 60 * 1000; // 7 years

    if (entityType?.toLowerCase().includes('financial')) {
      return 7 * 365 * 24 * 60 * 60 * 1000; // 7 years
    }

    if (entityType?.toLowerCase().includes('user')) {
      return 3 * 365 * 24 * 60 * 60 * 1000; // 3 years
    }

    return defaultRetention;
  }

  private classifyDataSensitivity(
    entityType: string,
    data?: any
  ): 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' {
    if (entityType?.toLowerCase().includes('financial') ||
        entityType?.toLowerCase().includes('payment')) {
      return 'RESTRICTED';
    }

    if (entityType?.toLowerCase().includes('user') ||
        data?.email || data?.phone) {
      return 'CONFIDENTIAL';
    }

    return 'INTERNAL';
  }

  private determineSeverity(
    action: string,
    status?: AuditStatus
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (status === AuditStatus.FAILURE) {
      if (action.includes('SECURITY') || action.includes('LOGIN')) {
        return 'HIGH';
      }
      return 'MEDIUM';
    }

    if (action.includes('WALLET') || action.includes('FINANCIAL')) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  private determineCategory(
    action: string,
    entityType?: string
  ): 'ACCESS' | 'DATA' | 'SYSTEM' | 'COMPLIANCE' | 'SECURITY' {
    if (action.includes('LOGIN') || action.includes('AUTH')) {
      return 'ACCESS';
    }

    if (action.includes('SECURITY')) {
      return 'SECURITY';
    }

    if (action.includes('COMPLIANCE') || action.includes('KYC')) {
      return 'COMPLIANCE';
    }

    if (entityType?.includes('SYSTEM') || action.includes('SYSTEM')) {
      return 'SYSTEM';
    }

    return 'DATA';
  }

  private getStreamIdByCategory(
    category: 'ACCESS' | 'DATA' | 'SYSTEM' | 'COMPLIANCE' | 'SECURITY'
  ): string {
    switch (category) {
      case 'COMPLIANCE':
        return this.complianceStreamId;
      case 'SECURITY':
        return this.securityStreamId;
      default:
        return this.auditStreamId;
    }
  }

  private getComplianceRetentionPeriod(regulation: string): number {
    const retentionPeriods: Record<string, number> = {
      'SOX': 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      'GDPR': 6 * 365 * 24 * 60 * 60 * 1000, // 6 years
      'CCPA': 3 * 365 * 24 * 60 * 60 * 1000, // 3 years
      'SEC': 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
      'FINRA': 3 * 365 * 24 * 60 * 60 * 1000, // 3 years
    };

    return retentionPeriods[regulation] || 7 * 365 * 24 * 60 * 60 * 1000;
  }

  private async triggerEmergencyBackup(auditLog: ZGAuditLog): Promise<void> {
    try {
      this.logger.warn('Critical security event detected - triggering emergency backup', {
        auditLogId: auditLog.id,
        action: auditLog.action,
        userId: auditLog.userId,
      });
      // This would trigger an immediate backup process
      // Implementation would depend on backup service integration
    } catch (error) {
      this.logger.error('Failed to trigger emergency backup:', error);
    }
  }
}
