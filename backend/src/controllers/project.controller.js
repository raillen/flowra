import * as projectService from '../services/project.service.js';
import { successResponse, paginatedResponse } from '../utils/responses.js';
import { logger } from '../config/logger.js';

/**
 * Project controller
 * Handles HTTP requests and responses for project endpoints
 * 
 * @module controllers/project
 */

/**
 * Creates a new project
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with created project
 */
export async function createProject(request, reply) {
  const userId = request.user.id;
  const projectData = request.body;

  const project = await projectService.createProject(projectData, userId);

  return reply
    .code(201)
    .send(successResponse(project, 'Project created successfully', 201));
}

/**
 * Retrieves a project by ID
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with project data
 */
export async function getProject(request, reply) {
  const { id } = request.params;
  const userId = request.user.id;

  const project = await projectService.getProjectById(id, userId);

  return reply.send(successResponse(project));
}

/**
 * Lists all projects for the authenticated user
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Paginated response with projects
 */
export async function listProjects(request, reply) {
  const userId = request.user.id;
  const { page = 1, limit = 10 } = request.query;

  const result = await projectService.listProjects(userId, { page, limit });

  return reply.send(
    paginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    )
  );
}

/**
 * Updates an existing project
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated project
 */
export async function updateProject(request, reply) {
  const { id } = request.params;
  const userId = request.user.id;
  const updateData = request.body;

  const project = await projectService.updateProject(id, updateData, userId);

  return reply.send(successResponse(project, 'Project updated successfully'));
}

/**
 * Deletes a project
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function deleteProject(request, reply) {
  const { id } = request.params;
  const userId = request.user.id;

  await projectService.deleteProject(id, userId);

  return reply
    .code(204)
    .send();
}


/**
 * Adds a member to the project
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 */
export async function addMember(request, reply) {
  const { id } = request.params;
  const userId = request.user.id;
  const { userId: targetUserId } = request.body;

  const result = await projectService.addMember(id, userId, targetUserId);

  return reply.send(successResponse(result, 'Member added successfully'));
}

/**
 * Removes a member from the project
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 */
export async function removeMember(request, reply) {
  const { id, userId: targetUserId } = request.params;
  const userId = request.user.id;

  await projectService.removeMember(id, userId, targetUserId);

  return reply.send(successResponse(null, 'Member removed successfully'));
}
