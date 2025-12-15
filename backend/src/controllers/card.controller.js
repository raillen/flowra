import * as cardService from '../services/card.service.js';
import { successResponse } from '../utils/responses.js';

/**
 * Card controller
 * Handles HTTP requests and responses for card endpoints
 * 
 * @module controllers/card
 */

/**
 * Creates a new card
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with created card
 */
export async function createCard(request, reply) {
  const { projectId, boardId, columnId } = request.params;
  const cardData = request.body;

  const card = await cardService.createCard(boardId, columnId, cardData);

  return reply
    .code(201)
    .send(successResponse(card, 'Card created successfully', 201));
}

/**
 * Retrieves a card by ID
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with card data
 */
export async function getCard(request, reply) {
  const { projectId, boardId, cardId } = request.params;

  const card = await cardService.getCardById(boardId, cardId);

  return reply.send(successResponse(card));
}

/**
 * Lists all cards for a board
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with cards list
 */
export async function listCards(request, reply) {
  const { projectId, boardId } = request.params;

  const cards = await cardService.listCards(boardId);

  return reply.send(successResponse(cards));
}

/**
 * Updates an existing card
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated card
 */
export async function updateCard(request, reply) {
  const { projectId, boardId, cardId } = request.params;
  const updateData = request.body;

  const card = await cardService.updateCard(boardId, cardId, updateData);

  return reply.send(successResponse(card, 'Card updated successfully'));
}

/**
 * Deletes a card
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Success response
 */
export async function deleteCard(request, reply) {
  const { projectId, boardId, cardId } = request.params;

  await cardService.deleteCard(boardId, cardId);

  return reply
    .code(204)
    .send();
}

/**
 * Moves a card to a different column and/or reorders it
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated card
 */
export async function moveCard(request, reply) {
  const { projectId, boardId, cardId } = request.params;
  const { columnId, order } = request.body;



  const card = await cardService.moveCard(boardId, cardId, columnId, order);

  return reply.send(successResponse(card, 'Card moved successfully'));
}

// ============================================
// Card Relations Endpoints
// ============================================

/**
 * Updates card assignees
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated card
 */
export async function updateAssignees(request, reply) {
  const { projectId, boardId, cardId } = request.params;
  const { assigneeIds } = request.body;

  await cardService.updateCardAssignees(boardId, cardId, assigneeIds);
  const card = await cardService.getCardById(boardId, cardId);

  return reply.send(successResponse(card, 'Assignees updated successfully'));
}

/**
 * Updates card watchers
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated card
 */
export async function updateWatchers(request, reply) {
  const { projectId, boardId, cardId } = request.params;
  const { watcherIds } = request.body;

  await cardService.updateCardWatchers(boardId, cardId, watcherIds);
  const card = await cardService.getCardById(boardId, cardId);

  return reply.send(successResponse(card, 'Watchers updated successfully'));
}

/**
 * Updates cards that block this card
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated card
 */
export async function updateBlockers(request, reply) {
  const { projectId, boardId, cardId } = request.params;
  const { blockedByIds } = request.body;

  await cardService.updateCardBlockers(boardId, cardId, blockedByIds);
  const card = await cardService.getCardById(boardId, cardId);

  return reply.send(successResponse(card, 'Blockers updated successfully'));
}

/**
 * Updates related cards
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated card
 */
export async function updateRelations(request, reply) {
  const { projectId, boardId, cardId } = request.params;
  const { relatedToIds } = request.body;

  await cardService.updateCardRelations(boardId, cardId, relatedToIds);
  const card = await cardService.getCardById(boardId, cardId);

  return reply.send(successResponse(card, 'Relations updated successfully'));
}

/**
 * Gets subtasks for a card
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with subtasks
 */
export async function getSubtasks(request, reply) {
  const { projectId, boardId, cardId } = request.params;

  const subtasks = await cardService.getSubtasks(boardId, cardId);

  return reply.send(successResponse(subtasks));
}


/**
 * Search cards globally (user access scope)
 */
export async function searchCards(request, reply) {
  const { search } = request.query;
  const userId = request.user.id;

  const cards = await cardService.searchCards(userId, search);
  return reply.send(successResponse(cards));
}
