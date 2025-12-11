import * as columnService from '../services/column.service.js';
import { successResponse } from '../utils/responses.js';

/**
 * Column controller
 * Handles HTTP requests and responses for column endpoints
 * 
 * @module controllers/column
 */

/**
 * Creates a new column
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with created column
 */
export async function createColumn(request, reply) {
  const { projectId, boardId } = request.params;
  const columnData = request.body;
  
  const column = await columnService.createColumn(boardId, columnData);
  
  return reply
    .code(201)
    .send(successResponse(column, 'Column created successfully', 201));
}

/**
 * Retrieves a column by ID
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with column data
 */
export async function getColumn(request, reply) {
  const { projectId, boardId, columnId } = request.params;
  
  const column = await columnService.getColumnById(boardId, columnId);
  
  return reply.send(successResponse(column));
}

/**
 * Lists all columns for a board
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with columns list
 */
export async function listColumns(request, reply) {
  const { projectId, boardId } = request.params;
  
  const columns = await columnService.listColumns(boardId);
  
  return reply.send(successResponse(columns));
}

/**
 * Updates an existing column
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated column
 */
export async function updateColumn(request, reply) {
  const { projectId, boardId, columnId } = request.params;
  const updateData = request.body;
  
  const column = await columnService.updateColumn(boardId, columnId, updateData);
  
  return reply.send(successResponse(column, 'Column updated successfully'));
}

/**
 * Deletes a column
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function deleteColumn(request, reply) {
  const { projectId, boardId, columnId } = request.params;
  
  await columnService.deleteColumn(boardId, columnId);
  
  return reply
    .code(204)
    .send();
}

/**
 * Updates column order
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function updateColumnOrder(request, reply) {
  const { projectId, boardId } = request.params;
  const { columns } = request.body;
  
  await columnService.updateColumnOrder(boardId, columns);
  
  return reply.send(successResponse(null, 'Column order updated successfully'));
}

