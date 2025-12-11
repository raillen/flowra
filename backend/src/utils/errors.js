/**
 * Custom error classes and error handling utilities
 * 
 * @module utils/errors
 */

/**
 * Base application error class
 * @extends {Error}
 */
export class AppError extends Error {
  /**
   * Creates an application error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} isOperational - Whether error is operational (expected)
   */
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad request error (400)
 * @extends {AppError}
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * Unauthorized error (401)
 * @extends {AppError}
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden error (403)
 * @extends {AppError}
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Not found error (404)
 * @extends {AppError}
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Conflict error (409)
 * @extends {AppError}
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

/**
 * Validation error (422)
 * @extends {AppError}
 */
export class ValidationError extends AppError {
  /**
   * Creates a validation error with field details
   * @param {string} message - Error message
   * @param {Object} errors - Field-specific errors
   */
  constructor(message = 'Validation failed', errors = {}) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Handles and formats errors for API responses
 * @param {Error} error - Error instance
 * @returns {Object} Formatted error response
 */
export function formatError(error) {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.statusCode,
        ...(error.errors && { errors: error.errors }),
      },
    };
  }

  // Don't expose internal errors in production
  return {
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      code: 500,
    },
  };
}

