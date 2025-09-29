import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { ZodError } from 'zod';
import { createLogger } from '../services/logger.service';
import { ApiErrorResponse } from '@stack/shared-types';
import { AuthServiceError } from '../services/auth.service';
import { WalletServiceError } from '../services/wallet.service';
import { TurnkeyServiceError } from '../services/turnkey.service';

/**
 * Global error handler for the API
 */
export const errorHandler = async (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const logger = createLogger({
    correlationId: request.correlationId,
    service: 'ErrorHandler',
  });

  // Log the error with context
  logger.error('Request error', error, {
    method: request.method,
    url: request.url,
    statusCode: error.statusCode,
    userAgent: request.headers['user-agent'],
    userId: request.user?.userId,
  });

  let statusCode = 500;
  let errorResponse: ApiErrorResponse;

  // Handle different types of errors
  if (error instanceof ZodError) {
    // Validation errors
    statusCode = 400;
    errorResponse = {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
      correlationId: request.correlationId,
    };
  } else if (error instanceof AuthServiceError) {
    // Authentication/authorization errors
    statusCode = error.statusCode;
    errorResponse = {
      success: false,
      error: error.message,
      code: error.code,
      correlationId: request.correlationId,
    };
  } else if (error instanceof WalletServiceError) {
    // Wallet service errors
    statusCode = 400; // Most wallet errors are client errors
    errorResponse = {
      success: false,
      error: error.message,
      code: error.code,
      correlationId: request.correlationId,
    };
  } else if (error instanceof TurnkeyServiceError) {
    // Turnkey service errors
    statusCode = error.isRetryable ? 503 : 400;
    errorResponse = {
      success: false,
      error: error.message,
      code: error.code,
      correlationId: request.correlationId,
    };

    // Log additional context for Turnkey errors
    logger.error('Turnkey service error details', null, {
      isRetryable: error.isRetryable,
      details: error.details,
    });
  } else if (error.statusCode && error.statusCode < 500) {
    // Other 4xx errors (client errors)
    statusCode = error.statusCode;
    errorResponse = {
      success: false,
      error: error.message || 'Bad Request',
      code: 'CLIENT_ERROR',
      correlationId: request.correlationId,
    };
  } else {
    // 5xx errors (server errors)
    statusCode = error.statusCode || 500;
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    errorResponse = {
      success: false,
      error: isDevelopment ? error.message : 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      correlationId: request.correlationId,
    };

    // Log additional context for server errors
    logger.error('Internal server error', error, {
      stack: error.stack,
      details: isDevelopment ? error : 'Error details hidden in production',
    });
  }

  // Increment error metrics
  logger.metric('api_errors_total', 1, {
    status_code: statusCode.toString(),
    error_code: errorResponse.code || 'unknown',
    method: request.method,
    path: request.url,
  });

  reply.status(statusCode).send(errorResponse);
};

/**
 * Not found handler for 404 errors
 */
export const notFoundHandler = (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const logger = createLogger({
    correlationId: request.correlationId,
    service: 'NotFoundHandler',
  });

  logger.warn('Route not found', {
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
  });

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: `Route ${request.method} ${request.url} not found`,
    code: 'ROUTE_NOT_FOUND',
    correlationId: request.correlationId,
  };

  // Increment 404 metrics
  logger.metric('api_404_total', 1, {
    method: request.method,
    path: request.url,
  });

  reply.status(404).send(errorResponse);
};

/**
 * Timeout handler
 */
export const timeoutHandler = (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const logger = createLogger({
    correlationId: request.correlationId,
    service: 'TimeoutHandler',
  });

  logger.warn('Request timeout', {
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
  });

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: 'Request timeout',
    code: 'REQUEST_TIMEOUT',
    correlationId: request.correlationId,
  };

  // Increment timeout metrics
  logger.metric('api_timeouts_total', 1, {
    method: request.method,
    path: request.url,
  });

  reply.status(408).send(errorResponse);
};

/**
 * Rate limit error handler
 */
export const rateLimitHandler = (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const logger = createLogger({
    correlationId: request.correlationId,
    service: 'RateLimitHandler',
  });

  logger.warn('Rate limit exceeded', {
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
    ip: request.ip,
  });

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: 'Rate limit exceeded',
    code: 'RATE_LIMIT_EXCEEDED',
    correlationId: request.correlationId,
  };

  // Increment rate limit metrics
  logger.metric('api_rate_limits_total', 1, {
    method: request.method,
    path: request.url,
  });

  reply.status(429).send(errorResponse);
};

/**
 * Validation error helper
 */
export const createValidationError = (
  field: string,
  message: string,
  correlationId?: string
): ApiErrorResponse => {
  return {
    success: false,
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: [{
      field,
      message,
    }],
    correlationId,
  };
};

/**
 * Success response helper
 */
export const createSuccessResponse = <T>(
  data: T,
  message?: string
): { success: true; message?: string; data: T } => {
  return {
    success: true,
    ...(message && { message }),
    data,
  };
};
