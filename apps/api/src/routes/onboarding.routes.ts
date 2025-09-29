import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { createLogger } from '../services/logger.service';
import { createSuccessResponse, createValidationError } from '../middleware/error.middleware';
import { 
  OnboardingStartRequestSchema, 
  KYCCallbackRequestSchema,
  OnboardingStartRequest,
  KYCCallbackRequest 
} from '@stack/shared-types';
import { KYCStatus } from '@prisma/client';

export const onboardingRoutes = async (fastify: FastifyInstance) => {
  /**
   * POST /api/v1/onboarding/start
   * Initialize user onboarding process
   */
  fastify.post<{
    Body: OnboardingStartRequest;
  }>(
    '/start',
    {
      schema: {
        tags: ['Onboarding'],
        summary: 'Start user onboarding',
        description: 'Creates or finds a user and initiates the KYC process',
        body: {
          type: 'object',
          properties: {
            emailOrPhone: { type: 'string', description: 'User email or phone number' },
            referralCode: { type: 'string', description: 'Optional referral code' },
          },
          required: ['emailOrPhone'],
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
                  onboardingStatus: { 
                    type: 'string',
                    enum: ['KYC_PENDING', 'KYC_PASSED', 'KYC_FAILED']
                  },
                  sessionJwt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: OnboardingStartRequest }>, reply: FastifyReply) => {
      const logger = createLogger({
        correlationId: request.correlationId,
        service: 'OnboardingRoutes',
      });

      try {
        // Validate request body
        const validationResult = OnboardingStartRequestSchema.safeParse(request.body);
        if (!validationResult.success) {
          return reply.status(400).send(
            createValidationError(
              'body',
              validationResult.error.errors[0].message,
              request.correlationId
            )
          );
        }

        const { emailOrPhone, referralCode } = validationResult.data;
        
        logger.info('Starting onboarding process', { 
          emailOrPhone: emailOrPhone.substring(0, 3) + '***', // Partial mask for logging
          hasReferral: !!referralCode 
        });

        // Get request metadata
        const ipAddress = AuthService.getIPAddress(request);
        const userAgent = AuthService.getUserAgent(request);

        // Initialize auth service
        const authService = new AuthService(request.correlationId);

        // Validate referral code if provided
        if (referralCode) {
          const isValidReferral = await authService.validateReferralCode(referralCode);
          if (!isValidReferral) {
            return reply.status(400).send(
              createValidationError(
                'referralCode',
                'Invalid referral code',
                request.correlationId
              )
            );
          }
        }

        // Create or find user and generate token
        const authToken = await authService.createOrFindUserAndGenerateToken({
          emailOrPhone,
          referralCode,
          correlationId: request.correlationId,
          ipAddress,
          userAgent,
        });

        // Map KYC status to onboarding status
        let onboardingStatus: 'KYC_PENDING' | 'KYC_PASSED' | 'KYC_FAILED';
        switch (authToken.user.kycStatus) {
          case KYCStatus.PASSED:
            onboardingStatus = 'KYC_PASSED';
            break;
          case KYCStatus.FAILED:
            onboardingStatus = 'KYC_FAILED';
            break;
          default:
            onboardingStatus = 'KYC_PENDING';
            break;
        }

        logger.info('Onboarding started successfully', {
          userId: authToken.user.id,
          onboardingStatus,
        });

        // Return response
        const response = {
          userId: authToken.user.id,
          onboardingStatus,
          sessionJwt: authToken.token,
        };

        reply.send(createSuccessResponse(response, 'Onboarding started successfully'));
      } catch (error) {
        logger.error('Onboarding start failed', error);
        throw error; // Let error middleware handle it
      }
    }
  );

  /**
   * POST /api/v1/onboarding/kyc/callback
   * KYC provider webhook callback
   */
  fastify.post<{
    Body: KYCCallbackRequest;
  }>(
    '/kyc/callback',
    {
      schema: {
        tags: ['Onboarding'],
        summary: 'KYC provider callback',
        description: 'Webhook endpoint for KYC provider to update user verification status',
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'User ID' },
            status: { 
              type: 'string', 
              enum: ['PASSED', 'FAILED', 'PENDING'],
              description: 'KYC verification status'
            },
            providerId: { type: 'string', description: 'KYC provider identifier' },
            details: { 
              type: 'object',
              description: 'Additional KYC provider data'
            },
          },
          required: ['userId', 'status'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: KYCCallbackRequest }>, reply: FastifyReply) => {
      const logger = createLogger({
        correlationId: request.correlationId,
        service: 'OnboardingRoutes',
        action: 'KYCCallback',
      });

      try {
        // Validate request body
        const validationResult = KYCCallbackRequestSchema.safeParse(request.body);
        if (!validationResult.success) {
          return reply.status(400).send(
            createValidationError(
              'body',
              validationResult.error.errors[0].message,
              request.correlationId
            )
          );
        }

        const { userId, status, providerId, details } = validationResult.data;
        
        logger.info('Processing KYC callback', { userId, status, providerId });

        // TODO: Validate webhook signature from KYC provider
        // const signature = request.headers['x-webhook-signature'];
        // await validateKYCWebhookSignature(signature, request.body);

        // Map callback status to KYCStatus enum
        let kycStatus: KYCStatus;
        switch (status) {
          case 'PASSED':
            kycStatus = KYCStatus.PASSED;
            break;
          case 'FAILED':
            kycStatus = KYCStatus.FAILED;
            break;
          case 'PENDING':
            kycStatus = KYCStatus.IN_PROGRESS;
            break;
          default:
            throw new Error(`Invalid KYC status: ${status}`);
        }

        // Update user KYC status
        const authService = new AuthService(request.correlationId);
        await authService.updateKYCStatus(
          userId,
          kycStatus,
          {
            providerId,
            providerDetails: details,
            webhookReceivedAt: new Date().toISOString(),
          },
          request.correlationId
        );

        logger.info('KYC status updated successfully', { userId, status: kycStatus });

        reply.send(createSuccessResponse(
          { updated: true },
          'KYC status updated successfully'
        ));
      } catch (error) {
        logger.error('KYC callback processing failed', error);
        throw error; // Let error middleware handle it
      }
    }
  );

  /**
   * Health check endpoint for onboarding service
   */
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['Onboarding'],
        summary: 'Onboarding service health check',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              service: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      reply.send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'onboarding',
      });
    }
  );
};
