import * as boardService from '../services/board.service.js';
import { successResponse } from '../utils/responses.js';

/**
 * Board controller
 * Handles HTTP requests and responses for board endpoints
 * 
 * @module controllers/board
 */

/**
 * Creates a new board
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with created board
 */
export async function createBoard(request, reply) {
  const { projectId } = request.params;
  const userId = request.user.id;
  const boardData = request.body;

  const board = await boardService.createBoard(projectId, boardData, userId);

  return reply
    .code(201)
    .send(successResponse(board, 'Board created successfully', 201));
}

/**
 * Retrieves a board by ID
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with board data
 */
export async function getBoard(request, reply) {
  const { projectId, boardId } = request.params;
  const userId = request.user.id;

  const board = await boardService.getBoardById(projectId, boardId, userId);

  return reply.send(successResponse(board));
}

/**
 * Lists all boards for a project
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with boards list
 */
export async function listBoards(request, reply) {
  const { projectId } = request.params;
  const userId = request.user.id;

  const boards = await boardService.listBoards(projectId, userId);

  return reply.send(successResponse(boards));
}

/**
 * Updates an existing board
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated board
 */
export async function updateBoard(request, reply) {
  const { projectId, boardId } = request.params;
  const userId = request.user.id;
  const updateData = request.body;

  const board = await boardService.updateBoard(projectId, boardId, updateData, userId);

  return reply.send(successResponse(board, 'Board updated successfully'));
}

/**
 * Deletes a board
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function deleteBoard(request, reply) {
  const { projectId, boardId } = request.params;
  const userId = request.user.id;

  await boardService.deleteBoard(projectId, boardId, userId);

  return reply
    .code(204)
    .send();
}


/**
 * Adds a member to the board
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 */
export async function addMember(request, reply) {
  const { projectId, boardId } = request.params;
  const userId = request.user.id;
  const { userId: targetUserId } = request.body;

  const result = await boardService.addMember(projectId, boardId, userId, targetUserId);

  return reply.send(successResponse(result, 'Member added successfully'));
}

/**
 * Removes a member from the board
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 */
export async function removeMember(request, reply) {
  const { projectId, boardId, userId: targetUserId } = request.params;
  const userId = request.user.id;

  await boardService.removeMember(projectId, boardId, userId, targetUserId);

  return reply.send(successResponse(null, 'Member removed successfully'));
}

/**
 * Search boards globally (user access scope)
 */
export async function searchBoards(request, reply) {
  const { search } = request.query;
  const userId = request.user.id;

  const boards = await boardService.searchBoards(userId, search);
  return reply.send(successResponse(boards));
}
