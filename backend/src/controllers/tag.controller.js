import * as tagService from '../services/tag.service.js';
import { successResponse } from '../utils/responses.js';

/**
 * Tag controller
 * Handles HTTP requests and responses for tag endpoints
 * 
 * @module controllers/tag
 */

/**
 * Creates a new tag
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with created tag
 */
export async function createTag(request, reply) {
  const { projectId, boardId } = request.params;
  const tagData = request.body;
  
  const tag = await tagService.createTag(boardId, tagData);
  
  return reply
    .code(201)
    .send(successResponse(tag, 'Tag created successfully', 201));
}

/**
 * Lists all tags for a board
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with tags list
 */
export async function listTags(request, reply) {
  const { projectId, boardId } = request.params;
  
  const tags = await tagService.listTags(boardId);
  
  return reply.send(successResponse(tags));
}

/**
 * Updates a tag
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated tag
 */
export async function updateTag(request, reply) {
  const { projectId, boardId, tagId } = request.params;
  const updateData = request.body;
  
  const tag = await tagService.updateTag(boardId, tagId, updateData);
  
  return reply.send(successResponse(tag, 'Tag updated successfully'));
}

/**
 * Deletes a tag
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function deleteTag(request, reply) {
  const { projectId, boardId, tagId } = request.params;
  
  await tagService.deleteTag(boardId, tagId);
  
  return reply
    .code(204)
    .send();
}

/**
 * Adds a tag to a card
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function addTagToCard(request, reply) {
  const { projectId, boardId, cardId, tagId } = request.params;
  
  await tagService.addTagToCard(boardId, cardId, tagId);
  
  return reply.send(successResponse(null, 'Tag added to card successfully'));
}

/**
 * Removes a tag from a card
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function removeTagFromCard(request, reply) {
  const { projectId, boardId, cardId, tagId } = request.params;
  
  await tagService.removeTagFromCard(boardId, cardId, tagId);
  
  return reply.send(successResponse(null, 'Tag removed from card successfully'));
}

