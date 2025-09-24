import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Register plugins
server.register(helmet, {
  contentSecurityPolicy: false,
});

server.register(cors, {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
});

server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Health check endpoint
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API routes
server.get('/api/v1/status', async () => {
  return { 
    message: 'STACK API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    console.log(`🚀 Server ready at http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();