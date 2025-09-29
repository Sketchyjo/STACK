import { z } from 'zod';

// Base interfaces for 0G storage operations
export interface ZGStorageMetadata {
  version: string;
  timestamp: number;
  userId: string;
  dataType: string;
  encrypted: boolean;
  checksum: string;
  size: number;
}

export interface ZGStorageResult<T = any> {
  success: boolean;
  data?: T;
  rootHash?: string;
  txHash?: string;
  metadata?: ZGStorageMetadata;
  error?: string;
}

export interface ZGBatchOperation {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  key: string;
  data?: any;
  streamId?: string;
}

// User Data Storage Types
export const ZGUserDataSchema = z.object({
  userId: z.string().uuid(),
  profile: z.object({
    displayName: z.string(),
    bio: z.string().optional(),
    avatarUrl: z.string().optional(),
    preferences: z.record(z.unknown()),
  }),
  settings: z.object({
    privacy: z.record(z.boolean()),
    notifications: z.record(z.boolean()),
    security: z.record(z.unknown()),
  }),
  metadata: z.object({
    version: z.string(),
    lastUpdated: z.number(),
    backupFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('WEEKLY'),
  }),
});

export type ZGUserData = z.infer<typeof ZGUserDataSchema>;

// Investment Record Types
export const ZGInvestmentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['BUY', 'SELL', 'TRANSFER', 'DIVIDEND', 'FEE']),
  asset: z.object({
    symbol: z.string(),
    name: z.string(),
    type: z.enum(['STOCK', 'CRYPTO', 'BOND', 'COMMODITY', 'BASKET']),
    assetId: z.string(),
  }),
  amount: z.object({
    quantity: z.string(), // Using string to preserve precision
    price: z.string(),
    currency: z.string(),
    fees: z.string().optional(),
  }),
  execution: z.object({
    timestamp: z.number(),
    orderId: z.string().optional(),
    executionId: z.string().optional(),
    venue: z.string().optional(),
  }),
  compliance: z.object({
    kycVerified: z.boolean(),
    amlChecked: z.boolean(),
    region: z.string(),
    regulations: z.array(z.string()).optional(),
  }),
  metadata: z.object({
    source: z.enum(['API', 'MANUAL', 'AUTOMATED', 'IMPORT']),
    confidence: z.number().min(0).max(1).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export type ZGInvestmentRecord = z.infer<typeof ZGInvestmentRecordSchema>;

// Portfolio History Types
export const ZGPortfolioSnapshotSchema = z.object({
  portfolioId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.number(),
  totalValue: z.string(),
  currency: z.string(),
  holdings: z.array(z.object({
    assetId: z.string(),
    symbol: z.string(),
    quantity: z.string(),
    currentPrice: z.string(),
    marketValue: z.string(),
    weight: z.number(),
    cost_basis: z.string().optional(),
    unrealized_pnl: z.string().optional(),
  })),
  performance: z.object({
    dayChange: z.string(),
    dayChangePercent: z.string(),
    totalReturn: z.string(),
    totalReturnPercent: z.string(),
    annualizedReturn: z.string().optional(),
    sharpeRatio: z.string().optional(),
    volatility: z.string().optional(),
  }),
  risk_metrics: z.object({
    var_95: z.string().optional(), // Value at Risk
    beta: z.string().optional(),
    max_drawdown: z.string().optional(),
    risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  }),
  metadata: z.object({
    snapshotType: z.enum(['SCHEDULED', 'EVENT_DRIVEN', 'MANUAL']),
    dataQuality: z.number().min(0).max(1),
    sources: z.array(z.string()),
  }),
});

export type ZGPortfolioSnapshot = z.infer<typeof ZGPortfolioSnapshotSchema>;

// Audit Log Types
export const ZGAuditLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  timestamp: z.number(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  sessionId: z.string().optional(),
  changes: z.object({
    before: z.record(z.unknown()).optional(),
    after: z.record(z.unknown()).optional(),
    fields: z.array(z.string()).optional(),
  }).optional(),
  compliance: z.object({
    regulation: z.array(z.string()).optional(),
    retention_period: z.number().optional(),
    classification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).optional(),
  }),
  metadata: z.object({
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    category: z.enum(['ACCESS', 'DATA', 'SYSTEM', 'COMPLIANCE', 'SECURITY']),
    automated: z.boolean().default(false),
  }),
});

export type ZGAuditLog = z.infer<typeof ZGAuditLogSchema>;

// Backup and Recovery Types
export const ZGBackupMetadataSchema = z.object({
  backupId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['FULL', 'INCREMENTAL', 'DIFFERENTIAL']),
  timestamp: z.number(),
  dataTypes: z.array(z.enum(['USER_DATA', 'INVESTMENTS', 'PORTFOLIO', 'AUDIT_LOGS'])),
  size: z.number(),
  compression: z.boolean().default(true),
  encryption: z.object({
    algorithm: z.string(),
    keyId: z.string(),
    iv: z.string(),
  }),
  integrity: z.object({
    checksum: z.string(),
    algorithm: z.enum(['SHA256', 'SHA512', 'MD5']),
  }),
  retention: z.object({
    expiresAt: z.number(),
    policy: z.string(),
    locked: z.boolean().default(false),
  }),
  recovery: z.object({
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    estimatedRestoreTime: z.number().optional(),
    dependencies: z.array(z.string()).optional(),
  }),
});

export type ZGBackupMetadata = z.infer<typeof ZGBackupMetadataSchema>;

// Analytics and Reporting Types
export const ZGAnalyticsReportSchema = z.object({
  reportId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['PERFORMANCE', 'RISK', 'ALLOCATION', 'TAX', 'COMPLIANCE']),
  period: z.object({
    start: z.number(),
    end: z.number(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
  }),
  data: z.record(z.unknown()), // Flexible structure for different report types
  insights: z.array(z.object({
    type: z.enum(['ALERT', 'RECOMMENDATION', 'INSIGHT', 'WARNING']),
    title: z.string(),
    description: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    actionable: z.boolean(),
    metadata: z.record(z.unknown()).optional(),
  })).optional(),
  generated_at: z.number(),
  expires_at: z.number().optional(),
});

export type ZGAnalyticsReport = z.infer<typeof ZGAnalyticsReportSchema>;

// Stream Configuration Types
export interface ZGStreamConfig {
  streamId: string;
  name: string;
  description?: string;
  retentionPolicy: {
    duration: number; // in seconds
    maxSize: number; // in bytes
  };
  accessControl: {
    public: boolean;
    allowedUsers: string[];
    permissions: Record<string, string[]>;
  };
  encryption: {
    enabled: boolean;
    algorithm?: string;
    keyRotation?: number; // in seconds
  };
}

// Data Sync Types
export interface ZGSyncStatus {
  lastSync: number;
  status: 'SYNCED' | 'PENDING' | 'FAILED' | 'CONFLICT';
  conflicts?: Array<{
    key: string;
    localHash: string;
    remoteHash: string;
    timestamp: number;
  }>;
  metrics: {
    totalRecords: number;
    syncedRecords: number;
    failedRecords: number;
    lastSyncDuration: number;
  };
}

// Query and Search Types
export interface ZGSearchQuery {
  userId?: string;
  dataType?: string;
  dateRange?: {
    start: number;
    end: number;
  };
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'ASC' | 'DESC';
  };
  pagination?: {
    offset: number;
    limit: number;
  };
}

// Error Types
export const ZGErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.number(),
  userId: z.string().optional(),
  operation: z.string().optional(),
  recoverable: z.boolean().default(true),
  retryAfter: z.number().optional(),
});

export type ZGError = z.infer<typeof ZGErrorSchema>;

// Configuration Types
export interface ZGServiceConfig {
  encryption: {
    algorithm: string;
    keyDerivation: string;
    saltLength: number;
    ivLength: number;
  };
  storage: {
    defaultStreamId: string;
    maxFileSize: number;
    compressionEnabled: boolean;
    redundancyLevel: number;
  };
  sync: {
    batchSize: number;
    retryAttempts: number;
    retryDelay: number;
    conflictResolution: 'LOCAL' | 'REMOTE' | 'MERGE' | 'MANUAL';
  };
  audit: {
    enabled: boolean;
    level: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
    retentionDays: number;
  };
}

// Export all schemas for validation
export const ZGSchemas = {
  UserData: ZGUserDataSchema,
  InvestmentRecord: ZGInvestmentRecordSchema,
  PortfolioSnapshot: ZGPortfolioSnapshotSchema,
  AuditLog: ZGAuditLogSchema,
  BackupMetadata: ZGBackupMetadataSchema,
  AnalyticsReport: ZGAnalyticsReportSchema,
  Error: ZGErrorSchema,
} as const;