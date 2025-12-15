import * as cardController from '../controllers/card.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validationMiddleware } from '../middleware/validation.middleware.js';
import {
  createCardSchema,
  updateCardSchema,
  cardIdSchema,
  moveCardSchema,
  updateCardAssigneesSchema,
  updateCardBlockersSchema,
  updateCardRelationsSchema,
} from '../validators/card.validator.js';

/**
 * Card routes
 * Defines all card-related endpoints
 * 
 * @module routes/card
 */
export async function cardRoutes(fastify) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // List cards for a board
  fastify.get(
    '/projects/:projectId/boards/:boardId/cards',
    {
      schema: {
        description: 'List all cards for a board',
        tags: ['cards'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            projectId: { type: 'string', format: 'uuid' },
            boardId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    cardController.listCards
  );

  // Create card
  fastify.post(
    '/projects/:projectId/boards/:boardId/columns/:columnId/cards',
    {
      preHandler: validationMiddleware(createCardSchema),
      schema: {
        description: 'Create a new card',
        tags: ['cards'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            projectId: { type: 'string', format: 'uuid' },
            boardId: { type: 'string', format: 'uuid' },
            columnId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            priority: { type: ['string', 'null'], enum: ['baixa', 'media', 'alta', 'urgente', null] },
            dueDate: { type: ['string', 'null'] },
            description: { type: ['string', 'null'] },
            assignedUserId: { type: ['string', 'null'], format: 'uuid' },
          },
        },
      },
    },
    cardController.createCard
  );

  // Get card by ID
  fastify.get(
    '/projects/:projectId/boards/:boardId/cards/:cardId',
    {
      preHandler: validationMiddleware(cardIdSchema),
      schema: {
        description: 'Get card by ID',
        tags: ['cards'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            projectId: { type: 'string', format: 'uuid' },
            boardId: { type: 'string', format: 'uuid' },
            cardId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    cardController.getCard
  );

  // Update card
  fastify.put(
    '/projects/:projectId/boards/:boardId/cards/:cardId',
    {
      preHandler: validationMiddleware(updateCardSchema),
      schema: {
        description: 'Update card',
        tags: ['cards'],
        security: [{ bearerAuth: [] }],
      },
    },
    cardController.updateCard
  );

  // Delete card
  fastify.delete(
    '/projects/:projectId/boards/:boardId/cards/:cardId',
    {
      preHandler: validationMiddleware(cardIdSchema),
      schema: {
        description: 'Delete card',
        tags: ['cards'],
        security: [{ bearerAuth: [] }],
      },
    },
    cardController.deleteCard
  );

  // Move card
  fastify.patch(
    '/projects/:projectId/boards/:boardId/cards/:cardId/move',
    {
      preHandler: validationMiddleware(moveCardSchema),
      schema: {
        description: 'Move card to different column',
        tags: ['cards'],
        security: [{ bearerAuth: [] }],
      },
    },
    cardController.moveCard
  );

  // ============================================
  // Card Relations Routes
  // ============================================

  // Update card assignees
  fastify.put(
    '/projects/:projectId/boards/:boardId/cards/:cardId/assignees',
    {
      preHandler: validationMiddleware(updateCardAssigneesSchema),
      schema: {
        description: 'Update card assignees',
        tags: ['cards', 'relations'],
        security: [{ bearerAuth: [] }],
      },
    },
    cardController.updateAssignees
  );

  // Update card watchers
  fastify.put(
    '/projects/:projectId/boards/:boardId/cards/:cardId/watchers',
    {
      preHandler: validationMiddleware(cardIdSchema),
      schema: {
        description: 'Update card watchers',
        tags: ['cards', 'relations'],
        security: [{ bearerAuth: [] }],
      },
    },
    cardController.updateWatchers
  );

  // Update card blockers
  fastify.put(
    '/projects/:projectId/boards/:boardId/cards/:cardId/blockers',
    {
      preHandler: validationMiddleware(updateCardBlockersSchema),
      schema: {
        description: 'Update cards that block this card',
        tags: ['cards', 'relations'],
        security: [{ bearerAuth: [] }],
      },
    },
    cardController.updateBlockers
  );

  // Update related cards
  fastify.put(
    '/projects/:projectId/boards/:boardId/cards/:cardId/relations',
    {
      preHandler: validationMiddleware(updateCardRelationsSchema),
      schema: {
        description: 'Update related cards',
        tags: ['cards', 'relations'],
        security: [{ bearerAuth: [] }],
      },
    },
    cardController.updateRelations
  );

  // Get subtasks
  fastify.get(
    '/projects/:projectId/boards/:boardId/cards/:cardId/subtasks',
    {
      preHandler: validationMiddleware(cardIdSchema),
      schema: {
        description: 'Get subtasks for a card',
        tags: ['cards', 'subtasks'],
        security: [{ bearerAuth: [] }],
      },
    },
    cardController.getSubtasks
  );

  // ============================================
  // Direct Card Routes (without project/board)
  // For simpler operations like archive/delete
  // ============================================

  // Direct update card (for archive)
  fastify.put(
    '/cards/:cardId',
    {
      schema: {
        description: 'Direct update card',
        tags: ['cards'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { cardId } = request.params;
      const updateData = request.body;

      // Get card to find its board
      const card = await fastify.prisma.card.findUnique({
        where: { id: cardId },
        select: { boardId: true }
      });

      if (!card) {
        return reply.status(404).send({ success: false, message: 'Card not found' });
      }

      // Update the card
      const updated = await fastify.prisma.card.update({
        where: { id: cardId },
        data: updateData
      });

      return reply.send({ success: true, data: updated, message: 'Card updated successfully' });
    }
  );

  // Direct delete card
  fastify.delete(
    '/cards/:cardId',
    {
      schema: {
        description: 'Direct delete card',
        tags: ['cards'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { cardId } = request.params;

      // Delete the card
      await fastify.prisma.card.delete({
        where: { id: cardId }
      });

      return reply.status(204).send();
    }
  );


  // Global Card Search
  fastify.get(
    '/cards',
    {
      schema: {
        description: 'Search cards globally',
        tags: ['cards'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            search: { type: 'string' }
          }
        }
      }
    },
    cardController.searchCards
  );
}
