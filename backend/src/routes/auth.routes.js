import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validationMiddleware } from '../middleware/validation.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator.js';

/**
 * Authentication routes
 * Defines all authentication-related endpoints
 * 
 * @module routes/auth
 * @param {FastifyInstance} fastify - Fastify instance
 */
export async function authRoutes(fastify) {
  // Register
  fastify.post(
    '/register',
    {
      preHandler: validationMiddleware(registerSchema),
      schema: {
        description: 'Register a new user',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 3, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        /*
                response: {
                  201: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { type: 'object', additionalProperties: true },
                    },
                  },
                },
                */
      },
    },
    authController.register
  );

  // Login
  fastify.post(
    '/login',
    {
      preHandler: validationMiddleware(loginSchema),
      schema: {
        description: 'Login user',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
      },
    },
    authController.login
  );

  // Get current user (requires authentication)
  fastify.get(
    '/me',
    {
      preHandler: authenticate,
      schema: {
        description: 'Get current authenticated user',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
      },
    },
    authController.getMe
  );

  // Update current user's profile (requires authentication)
  fastify.put(
    '/me',
    {
      preHandler: [authenticate, validationMiddleware(updateProfileSchema)],
      schema: {
        description: 'Update current user profile',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 3, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 6 },
          },
        },
      },
    },
    authController.updateProfile
  );

  // Search users
  fastify.get(
    '/users',
    {
      preHandler: authenticate,
      schema: {
        description: 'Search users',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            q: { type: 'string', minLength: 1 },
          },
          required: ['q']
        },
      },
    },
    authController.listUsers
  );
}
