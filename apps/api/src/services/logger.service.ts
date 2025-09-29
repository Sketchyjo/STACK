import pino from 'pino';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

// Create base logger instance
export const logger = pino({
  level: config.LOG_LEVEL,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  serializers: {
    error: pino.stdSerializers.err,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Correlation ID context
export interface LogContext {
  correlationId?: string;
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  [key: string]: any;
}

// Enhanced logger with context
export class ContextualLogger {
  private context: LogContext;

  constructor(initialContext: LogContext = {}) {
    this.context = {
      correlationId: initialContext.correlationId || uuidv4(),
      ...initialContext,
    };
  }

  addContext(context: Partial<LogContext>): ContextualLogger {
    return new ContextualLogger({ ...this.context, ...context });
  }

  info(message: string, data?: any) {
    logger.info({ ...this.context, ...data }, message);
  }

  warn(message: string, data?: any) {
    logger.warn({ ...this.context, ...data }, message);
  }

  error(message: string, error?: Error | any, data?: any) {
    logger.error({ 
      ...this.context, 
      error: error instanceof Error ? error : error,
      ...data 
    }, message);
  }

  debug(message: string, data?: any) {
    logger.debug({ ...this.context, ...data }, message);
  }

  // Audit logging specifically for wallet operations
  audit(action: string, status: 'SUCCESS' | 'FAILURE', details?: any) {
    logger.info({
      ...this.context,
      action,
      status,
      details,
      auditEvent: true,
    }, `Audit: ${action} - ${status}`);
  }

  // Performance logging
  timing(operation: string, duration: number, success: boolean = true) {
    logger.info({
      ...this.context,
      operation,
      duration,
      success,
      performance: true,
    }, `Performance: ${operation} completed in ${duration}ms`);
  }

  // Metrics logging (structured for monitoring systems)
  metric(name: string, value: number, tags?: Record<string, string>) {
    logger.info({
      ...this.context,
      metric: {
        name,
        value,
        tags,
        timestamp: Date.now(),
      },
    }, `Metric: ${name} = ${value}`);
  }
}

// Create a default instance
export const createLogger = (context?: LogContext) => new ContextualLogger(context);

// Performance timing utility
export const withTiming = async <T>(
  logger: ContextualLogger,
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.timing(operation, duration, true);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.timing(operation, duration, false);
    logger.error(`Operation ${operation} failed`, error);
    throw error;
  }
};

// Middleware helper for adding correlation ID to requests
export const addCorrelationId = () => {
  return (req: any, reply: any, next: any) => {
    const correlationId = req.headers['x-correlation-id'] || uuidv4();
    req.correlationId = correlationId;
    reply.header('x-correlation-id', correlationId);
    next();
  };
};