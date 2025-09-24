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

// Export all schemas for validation
export const schemas = {
  User: UserSchema,
  Investment: InvestmentSchema,
  Portfolio: PortfolioSchema,
  ApiResponse: ApiResponseSchema,
  LoginRequest: LoginRequestSchema,
  RegisterRequest: RegisterRequestSchema,
  Transaction: TransactionSchema,
} as const;