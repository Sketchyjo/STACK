import crypto from 'crypto';
import { logger } from './logger.service';

/**
 * Encryption service for securing sensitive data before storage
 * Uses AES-256-GCM for encryption with key derivation and secure key management
 */
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly saltLength = 32;
  private readonly tagLength = 16;
  private readonly iterations = 100000; // PBKDF2 iterations

  private masterKey: string | null = null;

  constructor() {
    this.masterKey = process.env.ENCRYPTION_MASTER_KEY || '';
    if (!this.masterKey) {
      logger.warn('ENCRYPTION_MASTER_KEY not set. Encryption services will be limited.');
    }
  }

  /**
   * Generate a secure random key for encryption
   */
  private generateKey(): Buffer {
    return crypto.randomBytes(this.keyLength);
  }

  /**
   * Derive encryption key from master key and salt using PBKDF2
   */
  private deriveKey(salt: Buffer, keyId?: string): Buffer {
    if (!this.masterKey) {
      throw new Error('Master key not available for key derivation');
    }

    const keyMaterial = keyId ? `${this.masterKey}:${keyId}` : this.masterKey;
    return crypto.pbkdf2Sync(keyMaterial, salt, this.iterations, this.keyLength, 'sha512');
  }

  /**
   * Encrypt sensitive data with optional key identifier
   */
  async encryptData(
    data: string | Buffer,
    keyId?: string
  ): Promise<{
    encrypted: string;
    salt: string;
    iv: string;
    tag: string;
    keyId?: string;
    algorithm: string;
  }> {
    try {
      if (!this.masterKey) {
        throw new Error('Master key not available for encryption');
      }

      // Generate salt and IV
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);

      // Derive encryption key
      const key = this.deriveKey(salt, keyId);

      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setAAD(Buffer.from(keyId || '', 'utf8')); // Additional authenticated data

      let encrypted = cipher.update(data, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        keyId,
        algorithm: this.algorithm,
      };
    } catch (error) {
      logger.error('Encryption error:', error);
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt data using provided encryption metadata
   */
  async decryptData(encryptionData: {
    encrypted: string;
    salt: string;
    iv: string;
    tag: string;
    keyId?: string;
    algorithm: string;
  }): Promise<string> {
    try {
      if (!this.masterKey) {
        throw new Error('Master key not available for decryption');
      }

      const { encrypted, salt, iv, tag, keyId, algorithm } = encryptionData;

      if (algorithm !== this.algorithm) {
        throw new Error(`Unsupported encryption algorithm: ${algorithm}`);
      }

      // Convert base64 strings back to buffers
      const saltBuffer = Buffer.from(salt, 'base64');
      const ivBuffer = Buffer.from(iv, 'base64');
      const tagBuffer = Buffer.from(tag, 'base64');

      // Derive decryption key
      const key = this.deriveKey(saltBuffer, keyId);

      // Create decipher
      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAuthTag(tagBuffer);
      decipher.setAAD(Buffer.from(keyId || '', 'utf8'));

      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt JSON data and return as base64 string
   */
  async encryptJSON(data: any, keyId?: string): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const encryptionResult = await this.encryptData(jsonString, keyId);
      
      // Create a container with all encryption metadata
      const container = {
        version: '1.0',
        timestamp: Date.now(),
        data: encryptionResult,
      };

      return Buffer.from(JSON.stringify(container)).toString('base64');
    } catch (error) {
      logger.error('JSON encryption error:', error);
      throw new Error(`JSON encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt base64 encoded JSON data
   */
  async decryptJSON<T = any>(encryptedData: string): Promise<T> {
    try {
      // Parse the container
      const containerJson = Buffer.from(encryptedData, 'base64').toString('utf8');
      const container = JSON.parse(containerJson);

      if (!container.data) {
        throw new Error('Invalid encrypted data format');
      }

      // Decrypt the data
      const decryptedString = await this.decryptData(container.data);
      return JSON.parse(decryptedString);
    } catch (error) {
      logger.error('JSON decryption error:', error);
      throw new Error(`JSON decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate secure hash for data integrity verification
   */
  generateHash(data: string | Buffer, algorithm: 'sha256' | 'sha512' = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Verify data integrity using hash
   */
  verifyHash(data: string | Buffer, expectedHash: string, algorithm: 'sha256' | 'sha512' = 'sha256'): boolean {
    const actualHash = this.generateHash(data, algorithm);
    return crypto.timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash));
  }

  /**
   * Generate secure random identifier
   */
  generateSecureId(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Encrypt PII (Personally Identifiable Information) with special handling
   */
  async encryptPII(data: {
    email?: string;
    phone?: string;
    ssn?: string;
    address?: any;
    [key: string]: any;
  }, userId: string): Promise<string> {
    try {
      // Use user-specific key derivation for PII
      const keyId = `pii:${userId}`;
      return await this.encryptJSON(data, keyId);
    } catch (error) {
      logger.error('PII encryption error:', error);
      throw new Error(`PII encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt PII data
   */
  async decryptPII<T = any>(encryptedData: string): Promise<T> {
    try {
      return await this.decryptJSON<T>(encryptedData);
    } catch (error) {
      logger.error('PII decryption error:', error);
      throw new Error(`PII decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt financial data with additional security measures
   */
  async encryptFinancialData(data: {
    amount?: string;
    accountNumber?: string;
    routingNumber?: string;
    cardNumber?: string;
    transactions?: any[];
    [key: string]: any;
  }, userId: string): Promise<string> {
    try {
      // Add timestamp and user context for financial data
      const enrichedData = {
        ...data,
        __metadata: {
          encrypted_at: Date.now(),
          user_id: userId,
          data_type: 'financial',
          version: '1.0',
        },
      };

      const keyId = `financial:${userId}`;
      return await this.encryptJSON(enrichedData, keyId);
    } catch (error) {
      logger.error('Financial data encryption error:', error);
      throw new Error(`Financial data encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt financial data
   */
  async decryptFinancialData<T = any>(encryptedData: string): Promise<T> {
    try {
      const decryptedData = await this.decryptJSON<T & { __metadata?: any }>(encryptedData);
      
      // Remove metadata before returning
      if (decryptedData && typeof decryptedData === 'object' && '__metadata' in decryptedData) {
        const { __metadata, ...cleanData } = decryptedData as any;
        return cleanData as T;
      }

      return decryptedData;
    } catch (error) {
      logger.error('Financial data decryption error:', error);
      throw new Error(`Financial data decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Key rotation - re-encrypt data with new key
   */
  async rotateKey(encryptedData: string, newKeyId?: string): Promise<string> {
    try {
      // First decrypt with old key
      const decryptedData = await this.decryptJSON(encryptedData);
      
      // Re-encrypt with new key
      return await this.encryptJSON(decryptedData, newKeyId);
    } catch (error) {
      logger.error('Key rotation error:', error);
      throw new Error(`Key rotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate encryption service configuration
   */
  validateConfig(): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (!this.masterKey) {
      issues.push('Master encryption key is not configured');
    }

    if (this.masterKey && this.masterKey.length < 32) {
      issues.push('Master encryption key is too short (minimum 32 characters)');
    }

    try {
      crypto.createHash('sha256');
    } catch (error) {
      issues.push('Crypto module is not available');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Generate encryption key for specific data type and user
   */
  generateDataTypeKey(dataType: string, userId: string): string {
    return `${dataType}:${userId}:${Date.now()}`;
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

// Export types for use in other modules
export interface EncryptedData {
  encrypted: string;
  salt: string;
  iv: string;
  tag: string;
  keyId?: string;
  algorithm: string;
}

export interface EncryptionContainer {
  version: string;
  timestamp: number;
  data: EncryptedData;
}