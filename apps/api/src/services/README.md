# 0G Storage Infrastructure for STACK

This directory contains a comprehensive 0G storage infrastructure designed to handle user data, investment records, and portfolio history in a secure, scalable, and decentralized manner. The infrastructure serves as the foundation for STACK's financial services, ensuring data integrity, compliance, and high availability.

## 🏗️ Architecture Overview

The 0G storage infrastructure is built with the following key principles:
- **Decentralization**: All data is stored on the 0G network for maximum availability and censorship resistance
- **Security**: End-to-end encryption with user-specific keys and audit trails
- **Scalability**: Designed to handle growing user bases and transaction volumes
- **Compliance**: Built-in regulatory compliance features for financial data
- **Reliability**: Automated backups, conflict resolution, and data synchronization

## 📁 File Structure

```
services/
├── zeroGService.ts       # Core 0G network interface and enhanced storage capabilities
├── encryption.service.ts # AES-256-GCM encryption for sensitive financial data
├── audit.service.ts      # Comprehensive audit logging with 0G integration
├── backup.service.ts     # Automated backup strategies and recovery mechanisms
├── analytics.service.ts  # Portfolio analytics and reporting from 0G data
├── sync.service.ts       # Data synchronization between local DB and 0G
└── types/
    └── zeroG.types.ts    # TypeScript type definitions and schemas
```

## 🔧 Core Services

### 1. ZeroGService (`zeroGService.ts`)

The main interface to the 0G network, providing:

**Core Features:**
- File and buffer upload/download
- Key-value storage operations
- User data management
- Investment record storage
- Portfolio snapshot management
- Analytics report storage
- Batch operations for efficiency
- Enhanced error handling with retry logic

**Key Methods:**
```typescript
// Store encrypted user data
await zeroGService.storeUserData(userData);

// Store investment records with compliance metadata
await zeroGService.storeInvestmentRecord(record);

// Store portfolio snapshots for historical tracking
await zeroGService.storePortfolioSnapshot(snapshot);

// Batch operations for efficiency
await zeroGService.batchStore(records);

// Search and retrieve data
await zeroGService.searchData(query);
```

### 2. EncryptionService (`encryption.service.ts`)

Provides military-grade encryption for sensitive financial data:

**Features:**
- AES-256-GCM encryption with PBKDF2 key derivation
- User-specific key generation and rotation
- PII and financial data specialized encryption
- Data integrity verification with secure hashing
- Support for key rotation and recovery

**Usage:**
```typescript
// Encrypt PII data
const encryptedPII = await encryptionService.encryptPII(userData, userId);

// Encrypt financial data with additional security
const encryptedFinancial = await encryptionService.encryptFinancialData(
  transactionData, 
  userId
);

// Verify data integrity
const isValid = encryptionService.verifyHash(data, expectedHash);
```

### 3. AuditService (`audit.service.ts`)

Enhanced audit logging system with 0G storage integration:

**Features:**
- Comprehensive audit trail storage
- Compliance-specific logging (SOX, GDPR, PCI-DSS)
- Security event monitoring
- Automated audit log backup to 0G
- Regulatory reporting capabilities

**Key Methods:**
```typescript
// Log compliance events
await auditService.logComplianceEvent(
  userId, 'GDPR', 'DATA_ACCESS', 'PASSED'
);

// Log security events
await auditService.logSecurityEvent(
  userId, 'LOGIN_ATTEMPT', 'HIGH', details
);

// Generate compliance reports
await auditService.generateComplianceReport(userId, ['SOX', 'PCI_DSS']);
```

### 4. BackupService (`backup.service.ts`)

Automated backup and recovery system:

**Features:**
- Automated daily, weekly, and monthly backups
- Incremental and differential backup strategies
- Data integrity verification
- Scheduled backup jobs with cron
- Disaster recovery procedures
- Backup retention policies

**Usage:**
```typescript
// Create user backup
await backupService.createUserBackup(userId, 'FULL', ['USER_DATA', 'INVESTMENTS']);

// Schedule automatic backups
await backupService.scheduleUserBackups(userId, {
  daily: true,
  weekly: true,
  monthly: true
});

// Restore from backup
await backupService.restoreFromBackup(userId, backupId, options);
```

### 5. AnalyticsService (`analytics.service.ts`)

Advanced portfolio analytics and reporting:

**Features:**
- Portfolio performance analysis
- Risk assessment and stress testing
- Asset allocation analysis
- Tax optimization reports
- Compliance reporting
- Benchmark comparison

**Report Types:**
```typescript
// Portfolio performance report
await analyticsService.generatePortfolioReport(
  userId, portfolioId, period, options
);

// Risk assessment
await analyticsService.generateRiskReport(userId, portfolioId, {
  includeStressTesting: true,
  includeScenarioAnalysis: true
});

// Tax optimization
await analyticsService.generateTaxReport(userId, 2024, {
  includeTaxLossHarvesting: true
});
```

### 6. SyncService (`sync.service.ts`)

Data synchronization between local database and 0G storage:

**Features:**
- Bidirectional data synchronization
- Conflict detection and resolution
- Scheduled sync operations
- Real-time sync capabilities
- Data consistency verification
- Batch synchronization

**Sync Operations:**
```typescript
// Sync user data
await syncService.syncUserData(userId);

// Full synchronization
await syncService.fullSync(userId);

// Resolve conflicts
await syncService.resolveConflict(userId, conflictId, 'REMOTE');

// Schedule automatic sync
await syncService.scheduleUserSync(userId, {
  enabled: true,
  intervalMinutes: 15
});
```

## 🔐 Security Features

### Data Encryption
- **AES-256-GCM**: Military-grade encryption for all sensitive data
- **PBKDF2**: Secure key derivation with 100,000 iterations
- **User-specific keys**: Each user has unique encryption keys
- **Key rotation**: Automated key rotation every 90 days

### Access Control
- **User isolation**: Each user's data is encrypted with their own keys
- **Stream-based access**: Data segregated into different streams by type
- **Audit logging**: All access attempts are logged and monitored

### Compliance
- **SOX compliance**: Financial data retention and audit trails
- **GDPR compliance**: User data privacy and right to deletion
- **PCI-DSS**: Payment card data security standards
- **FINRA/SEC**: Investment data regulatory requirements

## 🚀 Getting Started

### Environment Variables

Add the following environment variables to your `.env` file:

```bash
# 0G Network Configuration
ZG_EVM_RPC=https://evmrpc-testnet.0g.ai
ZG_INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai
ZG_KV_CLIENT_ADDR=http://3.101.147.150:6789
ZG_PRIVATE_KEY=your_private_key_here
ZG_FLOW_CONTRACT_ADDRESS=contract_address_here

# Encryption
ENCRYPTION_MASTER_KEY=your_secure_master_key_here

# Feature Flags
ENABLE_0G_AUDIT_STORAGE=true
```

### Basic Usage

```typescript
import { 
  zeroGService, 
  encryptionService, 
  auditService,
  backupService,
  analyticsService,
  syncService 
} from './services';

// Initialize services (automatically done via singleton pattern)

// Store user data securely
const userData = {
  userId: 'user123',
  profile: { displayName: 'John Doe' },
  settings: { privacy: {}, notifications: {} },
  metadata: { version: '1.0', lastUpdated: Date.now() }
};

await zeroGService.storeUserData(userData);

// Create scheduled backups
await backupService.scheduleUserBackups('user123', {
  daily: true,
  weekly: true
});

// Enable data synchronization
await syncService.scheduleUserSync('user123', {
  enabled: true,
  intervalMinutes: 15
});
```

## 📊 Monitoring and Health Checks

### Network Status
```typescript
const status = await zeroGService.getNetworkStatus();
console.log('0G Network Status:', status);
```

### Sync Status
```typescript
const syncStatus = await syncService.getSyncStatus(userId);
console.log('Data Sync Status:', syncStatus);
```

### Backup Verification
```typescript
const backups = await backupService.listUserBackups(userId);
console.log('Available Backups:', backups);
```

## 🔄 Data Flow

1. **Data Creation**: User creates data (profile, transactions, etc.)
2. **Encryption**: Data is encrypted using user-specific keys
3. **Storage**: Encrypted data is stored on 0G network
4. **Backup**: Automated backup processes create redundant copies
5. **Sync**: Data is synchronized between local DB and 0G storage
6. **Analytics**: Reports are generated from historical 0G data
7. **Audit**: All operations are logged for compliance

## 🛡️ Disaster Recovery

### Backup Strategy
- **Daily backups**: Incremental backups of transaction data
- **Weekly backups**: Full backups of user profiles and portfolios
- **Monthly backups**: Comprehensive system state backups
- **Yearly backups**: Long-term archival for compliance

### Recovery Procedures
1. **Data Loss Detection**: Automated monitoring detects missing data
2. **Backup Selection**: System selects most recent valid backup
3. **Data Restoration**: Automated restoration process begins
4. **Integrity Verification**: Restored data is verified for consistency
5. **Service Resume**: Normal operations resume after verification

## 📈 Scalability

The infrastructure is designed to scale horizontally:

- **Batch Operations**: Process multiple records efficiently
- **Stream Segregation**: Different data types use separate streams
- **Async Processing**: Non-blocking operations for better performance
- **Retry Logic**: Robust error handling with exponential backoff
- **Connection Pooling**: Efficient resource utilization

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing
```bash
npm run test:load
```

## 📋 Compliance Features

### Regulatory Compliance
- **Data Retention**: Automated retention policies per regulation
- **Audit Trails**: Immutable audit logs stored on 0G
- **Data Classification**: Automatic sensitivity classification
- **Access Logging**: Comprehensive access monitoring

### Privacy Controls
- **Data Minimization**: Only necessary data is stored
- **User Consent**: Explicit consent tracking
- **Right to Deletion**: Secure data deletion capabilities
- **Data Portability**: Export capabilities for user data

## 🔧 Configuration

### Service Configuration
Each service can be configured through environment variables or configuration objects:

```typescript
// Example: Custom sync configuration
await syncService.configure({
  batchSize: 200,
  syncIntervalMinutes: 30,
  conflictResolution: 'REMOTE'
});
```

### Stream Configuration
Data streams can be configured for different retention and access policies:

```typescript
const streamConfig = {
  streamId: 'user_data',
  retentionPolicy: { duration: 7 * 365 * 24 * 60 * 60 * 1000 }, // 7 years
  accessControl: { public: false, allowedUsers: [userId] },
  encryption: { enabled: true }
};
```

## 📞 Support

For technical support or questions about the 0G storage infrastructure:

1. Check the logs for error details
2. Verify network connectivity to 0G services
3. Ensure all environment variables are properly configured
4. Review the audit logs for any security-related issues

## 🚧 Future Enhancements

Planned improvements to the infrastructure:

- **Real-time Sync**: WebSocket-based real-time synchronization
- **Advanced Analytics**: AI-powered portfolio insights
- **Multi-chain Support**: Support for additional blockchain networks
- **Edge Caching**: Distributed caching for better performance
- **Advanced Encryption**: Post-quantum cryptography support

---

This infrastructure provides a robust, secure, and scalable foundation for handling financial data in the STACK application, ensuring regulatory compliance while maintaining user privacy and data integrity.