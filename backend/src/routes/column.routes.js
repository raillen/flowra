import * as columnController from '../controllers/column.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validationMiddleware } from '../middleware/validation.middleware.js';
import {
  createColumnSchema,
  updateColumnSchema,
  columnIdSchema,
  updateColumnOrderSchema,
} from '../validators/column.validator.js';

/**
 * Column routes
 * Defines all column-related endpoints
 * 
 * @module routes/column
 */
export async function columnRoutes(fastify) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // List columns for a board
  fastify.get(
    '/projects/:projectId/boards/:boardId/columns',
    {
      schema: {
        description: 'List all columns for a board',
        tags: ['columns'],
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
    columnController.listColumns
  );

  // Create column
  fastify.post(
    '/projects/:projectId/boards/:boardId/columns',
    {
      preHandler: validationMiddleware(createColumnSchema),
      schema: {
        description: 'Create a new column',
        tags: ['columns'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            projectId: { type: 'string', format: 'uuid' },
            boardId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 100 },
            color: { type: 'string', maxLength: 50 },
            order: { type: 'integer', minimum: 0 },
          },
        },
      },
    },
    columnController.createColumn
  );

  // Get column by ID
  fastify.get(
    '/projects/:projectId/boards/:boardId/columns/:columnId',
    {
      preHandler: validationMiddleware(columnIdSchema),
      schema: {
        description: 'Get column by ID',
        tags: ['columns'],
        security: [{ bearerAuth: [] }],
      },
    },
    columnController.getColumn
  );

  // Update column
  fastify.put(
    '/projects/:projectId/boards/:boardId/columns/:columnId',
    {
      preHandler: validationMiddleware(updateColumnSchema),
      schema: {
        description: 'Update column',
        tags: ['columns'],
        security: [{ bearerAuth: [] }],
      },
    },
    columnController.updateColumn
  );

  // Delete column
  fastify.delete(
    '/projects/:projectId/boards/:boardId/columns/:columnId',
    {
      preHandler: validationMiddleware(columnIdSchema),
      schema: {
        description: 'Delete column',
        tags: ['columns'],
        security: [{ bearerAuth: [] }],
      },
    },
    columnController.deleteColumn
  );

  // Update column order
  fastify.patch(
    '/projects/:projectId/boards/:boardId/columns/order',
    {
      preHandler: validationMiddleware(updateColumnOrderSchema),
      schema: {
        description: 'Update column order',
        tags: ['columns'],
        security: [{ bearerAuth: [] }],
      },
    },
    columnController.updateColumnOrder
  );
}

