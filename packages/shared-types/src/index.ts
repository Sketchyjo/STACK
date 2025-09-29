import { z } from 'zod';

// User Types
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(20),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  avatar: z.string().url().optional(),
  isEmailVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Investment Types
export const InvestmentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'BTC', 'ETH']),
  type: z.enum(['EQUITY', 'CRYPTO', 'BOND', 'REAL_ESTATE']),
  status: z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Investment = z.infer<typeof InvestmentSchema>;

// Portfolio Types
export const PortfolioSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  totalValue: z.number().nonnegative(),
  currency: z.enum(['USD', 'EUR', 'BTC', 'ETH']),
  isPublic: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;

// API Response Types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

// Auth Types
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// Transaction Types
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'DIVIDEND', 'FEE']),
  amount: z.number(),
  currency: z.enum(['USD', 'EUR', 'BTC', 'ETH']),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// Onboarding and Wallet Types
export const OnboardingStartRequestSchema = z.object({
  emailOrPhone: z.string().min(1),
  referralCode: z.string().optional(),
});

export type OnboardingStartRequest = z.infer<typeof OnboardingStartRequestSchema>;

export const OnboardingStartResponseSchema = z.object({
  userId: z.string(),
  onboardingStatus: z.enum(['KYC_PENDING', 'KYC_PASSED', 'KYC_FAILED']),
  sessionJwt: z.string(),
});

export type OnboardingStartResponse = z.infer<typeof OnboardingStartResponseSchema>;

export const KYCCallbackRequestSchema = z.object({
  userId: z.string(),
  status: z.enum(['PASSED', 'FAILED', 'PENDING']),
  providerId: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

export type KYCCallbackRequest = z.infer<typeof KYCCallbackRequestSchema>;

export const ChainTypeSchema = z.enum(['aptos', 'solana', 'evm']);
export type ChainType = z.infer<typeof ChainTypeSchema>;

export const WalletProvisionRequestSchema = z.object({
  chains: z.array(ChainTypeSchema).optional(),
});

export type WalletProvisionRequest = z.infer<typeof WalletProvisionRequestSchema>;

export const TurnkeyMetadataSchema = z.object({
  walletId: z.string(),
  accountId: z.string(),
  addressType: z.string(),
});

export type TurnkeyMetadata = z.infer<typeof TurnkeyMetadataSchema>;

export const WalletDataSchema = z.object({
  address: z.string(),
  turnkey: TurnkeyMetadataSchema,
});

export type WalletData = z.infer<typeof WalletDataSchema>;

export const WalletProvisionResponseSchema = z.object({
  userId: z.string(),
  wallets: z.record(ChainTypeSchema, WalletDataSchema),
});

export type WalletProvisionResponse = z.infer<typeof WalletProvisionResponseSchema>;

export const WalletListResponseSchema = z.object({
  userId: z.string(),
  wallets: z.record(ChainTypeSchema, WalletDataSchema),
});

export type WalletListResponse = z.infer<typeof WalletListResponseSchema>;

// Error Types
export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.array(ValidationErrorSchema).optional(),
  correlationId: z.string().optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// JWT Payload Type
export const JWTPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().optional(),
  kycStatus: z.enum(['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'EXPIRED']),
  iat: z.number(),
  exp: z.number(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

export type Transaction = z.infer<typeof TransactionSchema>;

// Export all schemas for validation
export const schemas = {
  User: UserSchema,
  Investment: InvestmentSchema,
  Portfolio: PortfolioSchema,
  ApiResponse: ApiResponseSchema,
  LoginRequest: LoginRequestSchema,
  RegisterRequest: RegisterRequestSchema,
  Transaction: TransactionSchema,
  OnboardingStartRequest: OnboardingStartRequestSchema,
  OnboardingStartResponse: OnboardingStartResponseSchema,
  KYCCallbackRequest: KYCCallbackRequestSchema,
  WalletProvisionRequest: WalletProvisionRequestSchema,
  WalletProvisionResponse: WalletProvisionResponseSchema,
  WalletListResponse: WalletListResponseSchema,
  ApiErrorResponse: ApiErrorResponseSchema,
  JWTPayload: JWTPayloadSchema,
} as const;
