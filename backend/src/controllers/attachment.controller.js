import * as attachmentService from '../services/attachment.service.js';
import { successResponse } from '../utils/responses.js';

/**
 * Attachment controller
 * Handles HTTP requests and responses for attachment endpoints
 * 
 * @module controllers/attachment
 */

/**
 * Creates a new attachment
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with created attachment
 */
export async function createAttachment(request, reply) {
  const { projectId, boardId, cardId } = request.params;
  const userId = request.user.id;
  const attachmentData = request.body;
  
  const attachment = await attachmentService.createAttachment(
    boardId,
    cardId,
    attachmentData,
    userId
  );
  
  return reply
    .code(201)
    .send(successResponse(attachment, 'Attachment created successfully', 201));
}

/**
 * Lists all attachments for a card
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with attachments list
 */
export async function listAttachments(request, reply) {
  const { projectId, boardId, cardId } = request.params;
  
  const attachments = await attachmentService.listAttachments(boardId, cardId);
  
  return reply.send(successResponse(attachments));
}

/**
 * Deletes an attachment
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function deleteAttachment(request, reply) {
  const { projectId, boardId, cardId, attachmentId } = request.params;
  const userId = request.user.id;
  
  await attachmentService.deleteAttachment(boardId, cardId, attachmentId, userId);
  
  return reply
    .code(204)
    .send();
}

