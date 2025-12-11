import { ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';
import { errorResponse } from '../utils/responses.js';

/**
 * Validation middleware factory
 * Creates middleware to validate request data using Zod schemas
 * 
 * @module middleware/validation
 * 
 * @param {Object} schema - Zod schema object with body, params, query properties
 * @returns {Function} Fastify middleware function
 * 
 * @example
 * const validate = validationMiddleware({
 *   body: createProjectSchema,
 *   params: projectIdSchema
 * });
 * 
 * fastify.post('/projects', { preHandler: validate }, handler);
 */
export function validationMiddleware(schema) {
  return async (request, reply) => {
    try {
      const validationResult = {};
      
      // Validate each part of the request
      if (schema.body) {
        validationResult.body = schema.body.parse(request.body);
        request.body = validationResult.body;
      }
      
      if (schema.params) {
        validationResult.params = schema.params.parse(request.params);
        request.params = validationResult.params;
      }
      
      if (schema.query) {
        validationResult.query = schema.query.parse(request.query);
        request.query = validationResult.query;
      }
      
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {});
        
        const validationError = new ValidationError(
          'Validation failed',
          formattedErrors
        );
        
        return reply
          .code(validationError.statusCode)
          .send(errorResponse(validationError.message, validationError.statusCode, formattedErrors));
      }
      
      throw error;
    }
  };
}

