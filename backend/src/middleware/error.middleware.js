import { AppError, formatError } from '../utils/errors.js';
import { logger } from '../config/logger.js';
import { errorResponse } from '../utils/responses.js';

/**
 * Global error handling middleware
 * Catches all errors and formats them appropriately
 * 
 * @module middleware/error
 * 
 * @param {Error} error - Error instance
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 */
export async function errorHandler(error, request, reply) {
  // Log error
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    request: {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
    },
  }, 'Request error');

  // Handle known application errors
  if (error instanceof AppError) {
    return reply
      .code(error.statusCode)
      .send(errorResponse(error.message, error.statusCode, error.errors));
  }

  // Handle validation errors
  if (error.validation) {
    return reply
      .code(400)
      .send(errorResponse('Validation error', 400, error.validation));
  }

  // Handle unknown errors
  const formattedError = formatError(error);
  return reply
    .code(formattedError.error.code)
    .send(errorResponse(formattedError.error.message, formattedError.error.code));
}

