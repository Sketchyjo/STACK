import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { connectDB } from '@stack/database';
import { validateConfig, config } from './config';
import { addCorrelationId } from './services/logger.service';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { onboardingRoutes } from './routes/onboarding.routes';
import { walletRoutes } from './routes/wallet.routes';
import { aiCfoRoutes } from './routes/aiCfo.routes';
import { createLogger } from './services/logger.service';

// Validate configuration on startup
validateConfig();

const logger = createLogger({ service: 'MainServer' });

const server = fastify({
  logger: {
    level: config.LOG_LEVEL,
  },
  // Request ID generation for correlation
  genReqId: () => {
    return Math.random().toString(36).substring(2, 15);
  },
});

// Register plugins
server.register(helmet, {
  contentSecurityPolicy: false,
});

server.register(cors, {
  origin: config.CORS_ORIGIN,
  credentials: true,
});

server.register(rateLimit, {
  max: config.RATE_LIMIT_MAX,
  timeWindow: config.RATE_LIMIT_WINDOW,
});

// Register JWT plugin
server.register(jwt, {
  secret: config.JWT_SECRET,
});

// Add correlation ID to all requests
server.addHook('onRequest', addCorrelationId());

// Request logging
server.addHook('onRequest', async (request, reply) => {
  logger.info('Incoming request', {
    method: request.method,
    url: request.url,
    correlationId: request.correlationId,
    userAgent: request.headers['user-agent'],
    ip: request.ip,
  });
});

// Response logging
server.addHook('onSend', async (request, reply, payload) => {
  logger.info('Outgoing response', {
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    correlationId: request.correlationId,
    responseTime: reply.getResponseTime(),
  });
});

// Health check endpoint
server.get('/health', async () => {
  return { 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.NODE_ENV,
  };
});

// API status endpoint
server.get('/api/v1/status', async () => {
  return { 
    message: 'STACK API is running',
    version: '1.0.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  };
});

// Register API routes
server.register(onboardingRoutes, { prefix: '/api/v1/onboarding' });
server.register(walletRoutes, { prefix: '/api/v1/wallets' });
server.register(aiCfoRoutes, { prefix: '/api/v1' });

// Error handling
server.setErrorHandler(errorHandler);
server.setNotFoundHandler(notFoundHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
  
  try {
    await server.close();
    logger.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const start = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Database connected successfully');

    // Start server
    const port = config.PORT;
    const host = config.HOST;
    
    await server.listen({ port, host });
    logger.info(`🚀 STACK API server ready at http://${host}:${port}`, {
      port,
      host,
      environment: config.NODE_ENV,
      logLevel: config.LOG_LEVEL,
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
};

start();
