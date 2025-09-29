// Test setup file for Jest
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Mock Turnkey SDK
jest.mock('@turnkey/http', () => ({
  TurnkeyClient: jest.fn().mockImplementation(() => ({
    createWallet: jest.fn(),
    createWalletAccounts: jest.fn(),
    getOrganization: jest.fn(),
  })),
}));

jest.mock('@turnkey/api-key-stamper', () => ({
  ApiKeyStamper: jest.fn().mockImplementation(() => ({})),
}));

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  wallet: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn(),
};

jest.mock('@stack/database', () => ({
  prisma: mockPrisma,
  connectDB: jest.fn(),
  disconnectDB: jest.fn(),
}));

// Export mocked prisma for use in tests
export { mockPrisma };

// Global test utilities
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};