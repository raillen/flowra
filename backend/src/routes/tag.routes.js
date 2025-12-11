import * as tagController from '../controllers/tag.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validationMiddleware } from '../middleware/validation.middleware.js';
import {
  createTagSchema,
  updateTagSchema,
  tagIdSchema,
  cardTagSchema,
} from '../validators/tag.validator.js';

/**
 * Tag routes
 * Defines all tag-related endpoints
 * 
 * @module routes/tag
 */
export async function tagRoutes(fastify) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // List tags for a board
  fastify.get(
    '/projects/:projectId/boards/:boardId/tags',
    {
      schema: {
        description: 'List all tags for a board',
        tags: ['tags'],
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
    tagController.listTags
  );

  // Create tag
  fastify.post(
    '/projects/:projectId/boards/:boardId/tags',
    {
      preHandler: validationMiddleware(createTagSchema),
      schema: {
        description: 'Create a new tag',
        tags: ['tags'],
        security: [{ bearerAuth: [] }],
      },
    },
    tagController.createTag
  );

  // Update tag
  fastify.put(
    '/projects/:projectId/boards/:boardId/tags/:tagId',
    {
      preHandler: validationMiddleware(updateTagSchema),
      schema: {
        description: 'Update tag',
        tags: ['tags'],
        security: [{ bearerAuth: [] }],
      },
    },
    tagController.updateTag
  );

  // Delete tag
  fastify.delete(
    '/projects/:projectId/boards/:boardId/tags/:tagId',
    {
      preHandler: validationMiddleware(tagIdSchema),
      schema: {
        description: 'Delete tag',
        tags: ['tags'],
        security: [{ bearerAuth: [] }],
      },
    },
    tagController.deleteTag
  );

  // Add tag to card
  fastify.post(
    '/projects/:projectId/boards/:boardId/cards/:cardId/tags/:tagId',
    {
      preHandler: validationMiddleware(cardTagSchema),
      schema: {
        description: 'Add tag to card',
        tags: ['tags'],
        security: [{ bearerAuth: [] }],
      },
    },
    tagController.addTagToCard
  );

  // Remove tag from card
  fastify.delete(
    '/projects/:projectId/boards/:boardId/cards/:cardId/tags/:tagId',
    {
      preHandler: validationMiddleware(cardTagSchema),
      schema: {
        description: 'Remove tag from card',
        tags: ['tags'],
        security: [{ bearerAuth: [] }],
      },
    },
    tagController.removeTagFromCard
  );
}

