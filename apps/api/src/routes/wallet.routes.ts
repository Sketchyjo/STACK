import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WalletService } from '../services/wallet.service';
import { AuthService } from '../services/auth.service';
import { createLogger } from '../services/logger.service';
import { createSuccessResponse, createValidationError } from '../middleware/error.middleware';
import { kycAuthMiddleware, getAuthenticatedUser } from '../middleware/auth.middleware';
import { 
  WalletProvisionRequestSchema,
  WalletProvisionRequest
} from '@stack/shared-types';

export const walletRoutes = async (fastify: FastifyInstance) => {
  /**
   * POST /api/v1/wallets/provision
   * Provision multi-chain wallets for authenticated user
   */
  fastify.post<{
    Body: WalletProvisionRequest;
  }>(
    '/provision',
    {
      preHandler: kycAuthMiddleware,
      schema: {
        tags: ['Wallets'],
        summary: 'Provision multi-chain wallets',
        description: 'Creates wallet accounts for specified chains via Turnkey integration. Requires KYC completion.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            chains: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['aptos', 'solana', 'evm']
              },
              description: 'Chains to provision wallets for (defaults to all enabled chains)',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  wallets: {
                    type: 'object',
                    additionalProperties: {
                      type: 'object',
                      properties: {
                        address: { type: 'string' },
                        turnkey: {
                          type: 'object',
                          properties: {
                            walletId: { type: 'string' },
                            accountId: { type: 'string' },
                            addressType: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: WalletProvisionRequest }>, reply: FastifyReply) => {
      const logger = createLogger({
        correlationId: request.correlationId,
        service: 'WalletRoutes',
      });

      try {
        const user = getAuthenticatedUser(request);
        
        // Validate request body if provided
        let validationResult;
        if (request.body && Object.keys(request.body).length > 0) {
          validationResult = WalletProvisionRequestSchema.safeParse(request.body);
          if (!validationResult.success) {
            return reply.status(400).send(
              createValidationError(
                'body',
                validationResult.error.errors[0].message,
                request.correlationId
              )
            );
          }
        }

        const chains = validationResult?.data?.chains;
        
        logger.info('Starting wallet provisioning', { 
          userId: user.userId,
          requestedChains: chains,
        });

        // Get request metadata
        const ipAddress = AuthService.getIPAddress(request);
        const userAgent = AuthService.getUserAgent(request);

        // Initialize wallet service
        const walletService = new WalletService(request.correlationId);

        // Provision wallets
        const result = await walletService.provisionWallets(user.userId, {
          chains,
          correlationId: request.correlationId,
          ipAddress,
          userAgent,
        });

        logger.info('Wallet provisioning completed', {
          userId: user.userId,
          provisionedChains: Object.keys(result.wallets),
        });

        reply.send(createSuccessResponse(result, 'Wallets provisioned successfully'));
      } catch (error) {
        logger.error('Wallet provisioning failed', error);
        throw error; // Let error middleware handle it
      }
    }
  );

  /**
   * GET /api/v1/wallets
   * Get all wallets for authenticated user
   */
  fastify.get(
    '/',
    {
      preHandler: kycAuthMiddleware,
      schema: {
        tags: ['Wallets'],
        summary: 'Get user wallets',
        description: 'Retrieves all wallet addresses for the authenticated user. Requires KYC completion.',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  wallets: {
                    type: 'object',
                    additionalProperties: {
                      type: 'object',
                      properties: {
                        address: { type: 'string' },
                        turnkey: {
                          type: 'object',
                          properties: {
                            walletId: { type: 'string' },
                            accountId: { type: 'string' },
                            addressType: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const logger = createLogger({
        correlationId: request.correlationId,
        service: 'WalletRoutes',
      });

      try {
        const user = getAuthenticatedUser(request);
        
        logger.info('Retrieving user wallets', { userId: user.userId });

        // Initialize wallet service
        const walletService = new WalletService(request.correlationId);

        // Get wallets
        const result = await walletService.getUserWallets(user.userId);

        logger.info('Retrieved user wallets', {
          userId: user.userId,
          walletCount: Object.keys(result.wallets).length,
        });

        reply.send(createSuccessResponse(result));
      } catch (error) {
        logger.error('Failed to retrieve user wallets', error);
        throw error; // Let error middleware handle it
      }
    }
  );

  /**
   * GET /api/v1/wallets/stats
   * Get wallet statistics (admin/monitoring endpoint)
   */
  fastify.get(
    '/stats',
    {
      schema: {
        tags: ['Wallets'],
        summary: 'Get wallet statistics',
        description: 'Retrieves wallet creation and usage statistics for monitoring',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  totalWallets: { type: 'number' },
                  activeWallets: { type: 'number' },
                  chainBreakdown: {
                    type: 'object',
                    additionalProperties: { type: 'number' },
                  },
                  recentCreations: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const logger = createLogger({
        correlationId: request.correlationId,
        service: 'WalletRoutes',
      });

      try {
        logger.info('Retrieving wallet statistics');

        // Initialize wallet service
        const walletService = new WalletService(request.correlationId);

        // Get statistics
        const stats = await walletService.getWalletStats();

        logger.info('Retrieved wallet statistics', stats);

        reply.send(createSuccessResponse(stats));
      } catch (error) {
        logger.error('Failed to retrieve wallet statistics', error);
        throw error; // Let error middleware handle it
      }
    }
  );

  /**
   * GET /api/v1/wallets/health
   * Health check for wallet service and dependencies
   */
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['Wallets'],
        summary: 'Wallet service health check',
        description: 'Checks the health of wallet service, Turnkey integration, and database connectivity',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  turnkey: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      latency: { type: 'number' },
                    },
                  },
                  database: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      latency: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const logger = createLogger({
        correlationId: request.correlationId,
        service: 'WalletRoutes',
      });

      try {
        logger.info('Performing wallet service health check');

        // Initialize wallet service
        const walletService = new WalletService(request.correlationId);

        // Check health
        const healthStatus = await walletService.healthCheck();

        logger.info('Wallet service health check completed', healthStatus);

        // Determine HTTP status based on health
        const httpStatus = healthStatus.status === 'healthy' ? 200 : 503;

        reply.status(httpStatus).send(createSuccessResponse(healthStatus));
      } catch (error) {
        logger.error('Wallet service health check failed', error);
        
        // Return unhealthy status
        reply.status(503).send(createSuccessResponse({
          status: 'unhealthy',
          error: error.message,
          turnkey: { status: 'unknown', latency: 0 },
          database: { status: 'unknown', latency: 0 },
        }));
      }
    }
  );

  /**
   * POST /api/v1/wallets/validate-address
   * Validate wallet address format for a specific chain
   */
  fastify.post<{
    Body: {
      address: string;
      chain: 'aptos' | 'solana' | 'evm';
    };
  }>(
    '/validate-address',
    {
      schema: {
        tags: ['Wallets'],
        summary: 'Validate wallet address',
        description: 'Validates that a wallet address has the correct format for the specified blockchain',
        body: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Wallet address to validate' },
            chain: { 
              type: 'string', 
              enum: ['aptos', 'solana', 'evm'],
              description: 'Blockchain to validate address for'
            },
          },
          required: ['address', 'chain'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  isValid: { type: 'boolean' },
                  address: { type: 'string' },
                  chain: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { address: string; chain: 'aptos' | 'solana' | 'evm' } }>, reply: FastifyReply) => {
      const logger = createLogger({
        correlationId: request.correlationId,
        service: 'WalletRoutes',
      });

      try {
        const { address, chain } = request.body;

        if (!address || !chain) {
          return reply.status(400).send(
            createValidationError(
              'body',
              'Both address and chain are required',
              request.correlationId
            )
          );
        }

        logger.info('Validating wallet address', { chain, address: address.substring(0, 8) + '...' });

        // Initialize wallet service to access validation methods
        const walletService = new WalletService(request.correlationId);
        
        // For now, we'll use the TurnkeyService validation method
        // In a real implementation, you might want to extract this to a separate utility
        const { TurnkeyService } = await import('../services/turnkey.service');
        const turnkeyService = new TurnkeyService(request.correlationId);
        
        const isValid = turnkeyService.validateAddress(address, chain);

        const result = {
          isValid,
          address,
          chain,
        };

        logger.info('Address validation completed', { 
          chain, 
          isValid,
          address: address.substring(0, 8) + '...'
        });

        reply.send(createSuccessResponse(result));
      } catch (error) {
        logger.error('Address validation failed', error);
        throw error; // Let error middleware handle it
      }
    }
  );
};