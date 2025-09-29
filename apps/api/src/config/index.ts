import { z } from 'zod';

// Environment schema validation
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT Configuration
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS Configuration
  CORS_ORIGIN: z.string().default('*'),

  // Turnkey Configuration
  TURNKEY_BASE_URL: z.string().url().default('https://api.turnkey.com'),
  TURNKEY_ORG_ID: z.string().min(1),
  TURNKEY_API_KEY: z.string().min(1),
  TURNKEY_PRIVATE_KEY: z.string().min(1), // For API key stamper

  // Feature Flags
  FEATURE_WALLET_APTOS_ENABLED: z.coerce.boolean().default(true),
  FEATURE_WALLET_SOLANA_ENABLED: z.coerce.boolean().default(true),
  FEATURE_WALLET_EVM_ENABLED: z.coerce.boolean().default(true),

  // KYC Provider (placeholder for future integration)
  KYC_PROVIDER_URL: z.string().url().optional(),
  KYC_PROVIDER_API_KEY: z.string().optional(),
  KYC_WEBHOOK_SECRET: z.string().optional(),

  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),
});

export type Config = z.infer<typeof envSchema>;

// Parse and validate environment variables
export const config = envSchema.parse(process.env);

// Chain configuration mapping
export const CHAIN_CONFIG = {
  aptos: {
    addressType: 'ADDRESS_TYPE_APTOS',
    curve: 'ed25519',
    enabled: config.FEATURE_WALLET_APTOS_ENABLED,
  },
  solana: {
    addressType: 'ADDRESS_TYPE_SOLANA',
    curve: 'ed25519',
    enabled: config.FEATURE_WALLET_SOLANA_ENABLED,
  },
  evm: {
    addressType: 'ADDRESS_TYPE_ETHEREUM',
    curve: 'secp256k1',
    enabled: config.FEATURE_WALLET_EVM_ENABLED,
  },
} as const;

// Export supported chain types
export type SupportedChain = keyof typeof CHAIN_CONFIG;
export const SUPPORTED_CHAINS = Object.keys(CHAIN_CONFIG) as SupportedChain[];

// Export enabled chains only
export const getEnabledChains = (): SupportedChain[] => {
  return SUPPORTED_CHAINS.filter(chain => CHAIN_CONFIG[chain].enabled);
};

// Validation helper
export const validateConfig = () => {
  try {
    envSchema.parse(process.env);
    console.log('✅ Configuration validated successfully');
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    process.exit(1);
  }
};