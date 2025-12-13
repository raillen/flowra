import * as authService from '../services/auth.service.js';
import { successResponse } from '../utils/responses.js';
import { config } from '../config/environment.js';
import { logger } from '../config/logger.js';

/**
 * Authentication controller
 * Handles HTTP requests and responses for authentication endpoints
 * 
 * @module controllers/auth
 */

/**
 * Registers a new user
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with created user and token
 */
export async function register(request, reply) {
  const { name, email, password, companyName } = request.body;

  const user = await authService.register({ name, email, password, companyName });

  // Generate JWT token
  const token = request.server.jwt.sign(
    { id: user.id, email: user.email, role: user.role, companyId: user.companyId || null },
    { expiresIn: config.jwtExpiresIn }
  );

  return reply
    .code(201)
    .send(successResponse({ user, token }, 'User registered successfully', 201));
}

/**
 * Authenticates a user
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with user and token
 */
export async function login(request, reply) {
  const { email, password } = request.body;

  const user = await authService.login(email, password);

  // Generate JWT token with companyId for multi-tenant support
  const token = request.server.jwt.sign(
    { id: user.id, email: user.email, role: user.role, companyId: user.companyId || null },
    { expiresIn: config.jwtExpiresIn }
  );

  return reply.send(successResponse({ user, token }, 'Login successful'));
}

/**
 * Gets current authenticated user
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with user data
 */
export async function getMe(request, reply) {
  const userId = request.user.id;
  const user = await authService.getUserById(userId);

  return reply.send(successResponse(user));
}

/**
 * Updates current user's profile
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated user data
 */
export async function updateProfile(request, reply) {
  const userId = request.user.id;
  const updateData = request.body;

  const user = await authService.updateUser(userId, updateData);

  return reply.send(successResponse(user, 'Profile updated successfully'));
}

/**
 * Search users
 */
export async function listUsers(request, reply) {
  const { q } = request.query;
  const users = await authService.searchUsers(q);
  return reply.send(successResponse(users));
}
