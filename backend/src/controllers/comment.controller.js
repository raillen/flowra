import * as commentService from '../services/comment.service.js';
import { successResponse } from '../utils/responses.js';

/**
 * Comment controller
 * Handles HTTP requests and responses for comment endpoints
 * 
 * @module controllers/comment
 */

/**
 * Creates a new comment
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with created comment
 */
export async function createComment(request, reply) {
  const { projectId, boardId, cardId } = request.params;
  const userId = request.user.id;
  const commentData = request.body;

  const comment = await commentService.createComment(boardId, cardId, commentData, userId);

  return reply
    .code(201)
    .send(successResponse(comment, 'Comment created successfully', 201));
}

/**
 * Lists all comments for a card
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with comments list
 */
export async function listComments(request, reply) {
  const { projectId, boardId, cardId } = request.params;

  const comments = await commentService.listComments(boardId, cardId);

  return reply.send(successResponse(comments));
}

/**
 * Updates a comment
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated comment
 */
export async function updateComment(request, reply) {
  const { projectId, boardId, cardId, commentId } = request.params;
  const userId = request.user.id;
  const updateData = request.body;

  const comment = await commentService.updateComment(boardId, cardId, commentId, updateData, userId);

  return reply.send(successResponse(comment, 'Comment updated successfully'));
}

/**
 * Deletes a comment
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function deleteComment(request, reply) {
  const { projectId, boardId, cardId, commentId } = request.params;
  const userId = request.user.id;

  await commentService.deleteComment(boardId, cardId, commentId, userId);

  return reply
    .code(204)
    .send();
}

export async function addReaction(request, reply) {
  const { projectId, boardId, cardId, commentId } = request.params;
  const userId = request.user.id;
  const { emoji } = request.body;

  const result = await commentService.addReaction(boardId, cardId, commentId, userId, emoji);
  return reply.send(successResponse(result));
}

export async function removeReaction(request, reply) {
  const { projectId, boardId, cardId, commentId } = request.params;
  const userId = request.user.id;
  const { emoji } = request.body;

  await commentService.removeReaction(boardId, cardId, commentId, userId, emoji);
  return reply.code(204).send();
}

