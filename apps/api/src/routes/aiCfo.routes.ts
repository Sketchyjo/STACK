import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { aiCfoService } from '../services/aiCfo.service';
import { aiCfoMonitoringService } from '../services/aiCfoMonitoring.service';
import { logger } from '../services/logger.service';

// Request/Response schemas for type safety
const generateInsightSchema = {
  body: {
    type: 'object',
    required: ['prompt'],
    properties: {
      prompt: { type: 'string', minLength: 1, maxLength: 2000 },
      context: { type: 'object' },
      model: { type: 'string', enum: ['gpt-oss-120b', 'deepseek-r1-70b'] },
      temperature: { type: 'number', minimum: 0, maximum: 1 },
      maxTokens: { type: 'number', minimum: 1, maximum: 2000 }
    }
  }
};

const userIdParamsSchema = {
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'string', minLength: 1 }
    }
  }
};

/**
 * AI CFO Routes - Powered by 0G Compute Network
 */
export async function aiCfoRoutes(fastify: FastifyInstance) {
  
  /**
   * Generate AI-powered financial insight
   * POST /ai-cfo/insight
   */
  fastify.post('/ai-cfo/insight', {
    schema: generateInsightSchema
  }, async (request: FastifyRequest<{
    Body: {
      prompt: string;
      context?: any;
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  }>, reply: FastifyReply) => {
    try {
      const { prompt, context, model, temperature, maxTokens } = request.body;
      const userId = (request as any).user?.userId; // From JWT middleware
      
      const result = await aiCfoService.generateInsight(
        prompt,
        context,
        userId,
        { model, temperature, maxTokens }
      );

      if (!result.success) {
        return reply.status(400).send({
          error: 'Failed to generate insight',
          message: result.error
        });
      }

      logger.info(`AI insight generated for request from user: ${userId || 'anonymous'}`);

      return reply.send({
        success: true,
        data: {
          insight: result.insight,
          model: result.model,
          metadata: result.metadata
        }
      });

    } catch (error) {
      logger.error('AI insight generation endpoint error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to process insight request'
      });
    }
  });

  /**
   * Generate weekly performance summary for user
   * POST /ai-cfo/weekly-summary/:userId
   */
  fastify.post('/ai-cfo/weekly-summary/:userId', {
    schema: userIdParamsSchema
  }, async (request: FastifyRequest<{
    Params: { userId: string }
  }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      
      // TODO: Add authorization check - ensure user can only access their own data
      // const authenticatedUserId = (request as any).user?.userId;
      // if (authenticatedUserId !== userId && !isAdmin(authenticatedUserId)) {
      //   return reply.status(403).send({ error: 'Unauthorized' });
      // }

      const result = await aiCfoService.generateWeeklyPerformanceSummary(userId);

      if (!result.success) {
        return reply.status(400).send({
          error: 'Failed to generate weekly summary',
          message: result.error
        });
      }

      logger.info(`Weekly performance summary generated for user: ${userId}`);

      return reply.send({
        success: true,
        data: {
          summary: result.summary,
          userId,
          generated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Weekly summary generation error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to generate weekly summary'
      });
    }
  });

  /**
   * Generate personalized nudges for user
   * POST /ai-cfo/nudges/:userId
   */
  fastify.post('/ai-cfo/nudges/:userId', {
    schema: userIdParamsSchema
  }, async (request: FastifyRequest<{
    Params: { userId: string }
  }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      
      // TODO: Add authorization check
      
      const result = await aiCfoService.generatePersonalizedNudge(userId);

      if (!result.success) {
        return reply.status(400).send({
          error: 'Failed to generate personalized nudges',
          message: result.error
        });
      }

      logger.info(`Personalized nudges generated for user: ${userId}`);

      return reply.send({
        success: true,
        data: result.nudge
      });

    } catch (error) {
      logger.error('Personalized nudge generation error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to generate personalized nudges'
      });
    }
  });

  /**
   * Get AI CFO service status and health
   * GET /ai-cfo/status
   */
  fastify.get('/ai-cfo/status', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await aiCfoService.getServiceStatus();

      if (!result.success) {
        return reply.status(503).send({
          error: 'Service unavailable',
          message: result.error
        });
      }

      return reply.send({
        success: true,
        data: result.status
      });

    } catch (error) {
      logger.error('AI CFO status check error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to check service status'
      });
    }
  });

  /**
   * Trigger weekly reports generation for all users (Admin only)
   * POST /ai-cfo/admin/trigger-weekly-reports
   */
  fastify.post('/ai-cfo/admin/trigger-weekly-reports', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // TODO: Add admin authorization check
      // const userId = (request as any).user?.userId;
      // if (!isAdmin(userId)) {
      //   return reply.status(403).send({ error: 'Admin access required' });
      // }

      // Trigger weekly reports generation asynchronously
      // Don't await to avoid timeout on large user bases
      aiCfoService['generateWeeklyReportsForAllUsers']().catch(error => {
        logger.error('Background weekly reports generation failed:', error);
      });

      logger.info('Weekly reports generation triggered by admin');

      return reply.send({
        success: true,
        message: 'Weekly reports generation triggered successfully',
        triggered_at: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Admin trigger weekly reports error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to trigger weekly reports'
      });
    }
  });

  /**
   * Trigger daily nudges generation for all users (Admin only)
   * POST /ai-cfo/admin/trigger-daily-nudges
   */
  fastify.post('/ai-cfo/admin/trigger-daily-nudges', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // TODO: Add admin authorization check
      
      // Trigger daily nudges generation asynchronously
      aiCfoService['generateDailyNudgesForActiveUsers']().catch(error => {
        logger.error('Background daily nudges generation failed:', error);
      });

      logger.info('Daily nudges generation triggered by admin');

      return reply.send({
        success: true,
        message: 'Daily nudges generation triggered successfully',
        triggered_at: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Admin trigger daily nudges error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to trigger daily nudges'
      });
    }
  });

  /**
   * Get available AI models and their status
   * GET /ai-cfo/models
   */
  fastify.get('/ai-cfo/models', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const models = [
        {
          name: 'gpt-oss-120b',
          provider: '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
          description: 'State-of-the-art 70B parameter model for general AI tasks',
          verification: 'TEE (TeeML)',
          capabilities: ['financial_analysis', 'portfolio_optimization', 'risk_assessment']
        },
        {
          name: 'deepseek-r1-70b',
          provider: '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3',
          description: 'Advanced reasoning model optimized for complex problem solving',
          verification: 'TEE (TeeML)',
          capabilities: ['complex_reasoning', 'strategic_planning', 'scenario_analysis']
        }
      ];

      return reply.send({
        success: true,
        data: {
          models,
          defaultModel: 'gpt-oss-120b',
          totalModels: models.length
        }
      });

    } catch (error) {
      logger.error('AI models listing error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to list AI models'
      });
    }
  });

  /**
   * Get comprehensive monitoring metrics
   * GET /ai-cfo/metrics
   */
  fastify.get('/ai-cfo/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metrics = aiCfoMonitoringService.getMetrics();
      
      return reply.send({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Error retrieving AI CFO metrics:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to retrieve metrics'
      });
    }
  });

  /**
   * Trigger comprehensive health check
   * POST /ai-cfo/health-check
   */
  fastify.post('/ai-cfo/health-check', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const healthCheck = await aiCfoMonitoringService.performHealthCheck();
      
      const statusCode = healthCheck.status === 'healthy' ? 200 : 
                        healthCheck.status === 'degraded' ? 206 : 503;
      
      return reply.status(statusCode).send({
        success: healthCheck.status !== 'unhealthy',
        data: healthCheck
      });
    } catch (error) {
      logger.error('Error performing health check:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Health check failed'
      });
    }
  });

  /**
   * Health check endpoint
   * GET /ai-cfo/health
   */
  fastify.get('/ai-cfo/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const status = aiCfoMonitoringService.getStatus();
      
      return reply.send({
        status: status.status,
        service: 'AI CFO powered by 0G Compute Network',
        initialized: status.initialized,
        lastHealthCheck: status.lastHealthCheck,
        alerts: status.alerts,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    } catch (error) {
      return reply.status(503).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

export default aiCfoRoutes;