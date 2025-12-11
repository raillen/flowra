import { UnauthorizedError } from '../utils/errors.js';
import { errorResponse } from '../utils/responses.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 * 
 * @module middleware/auth
 * 
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<void>}
 */
export async function authenticate(request, reply) {
  try {
    await request.jwtVerify();
    
    // User is now available in request.user (set by @fastify/jwt)
    if (!request.user) {
      throw new UnauthorizedError('Invalid token');
    }
  } catch (error) {
    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' || 
        error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
      return reply
        .code(401)
        .send(errorResponse('Invalid or expired token', 401));
    }
    
    return reply
      .code(401)
      .send(errorResponse('Authentication required', 401));
  }
}

/**
 * Authorization middleware factory
 * Checks if user has required role/permission
 * 
 * @param {string|Array<string>} requiredRoles - Required role(s)
 * @returns {Function} Middleware function
 */
export function authorize(requiredRoles) {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return async (request, reply) => {
    const userRole = request.user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return reply
        .code(403)
        .send(errorResponse('Insufficient permissions', 403));
    }
  };
}

