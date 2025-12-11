import * as collaboratorService from '../services/collaborator.service.js';
import { successResponse, paginatedResponse } from '../utils/responses.js';

/**
 * Collaborator controller
 * Handles HTTP requests and responses for collaborator endpoints
 * 
 * @module controllers/collaborator
 */

/**
 * Creates a new collaborator
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with created collaborator
 */
export async function createCollaborator(request, reply) {
  const collaboratorData = request.body;
  
  const collaborator = await collaboratorService.createCollaborator(collaboratorData);
  
  return reply
    .code(201)
    .send(successResponse(collaborator, 'Collaborator created successfully', 201));
}

/**
 * Retrieves a collaborator by ID
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with collaborator data
 */
export async function getCollaborator(request, reply) {
  const { id } = request.params;
  
  const collaborator = await collaboratorService.getCollaboratorById(id);
  
  return reply.send(successResponse(collaborator));
}

/**
 * Lists all collaborators
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Paginated response with collaborators
 */
export async function listCollaborators(request, reply) {
  const { page = 1, limit = 10 } = request.query;
  
  const result = await collaboratorService.listCollaborators({ page, limit });
  
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
 * Updates an existing collaborator
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated collaborator
 */
export async function updateCollaborator(request, reply) {
  const { id } = request.params;
  const updateData = request.body;
  
  const collaborator = await collaboratorService.updateCollaborator(id, updateData);
  
  return reply.send(successResponse(collaborator, 'Collaborator updated successfully'));
}

/**
 * Deletes a collaborator
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function deleteCollaborator(request, reply) {
  const { id } = request.params;
  
  await collaboratorService.deleteCollaborator(id);
  
  return reply
    .code(204)
    .send();
}

