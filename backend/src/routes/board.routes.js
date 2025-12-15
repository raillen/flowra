import * as boardController from '../controllers/board.controller.js';
import * as boardFieldConfigController from '../controllers/board-field-config.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validationMiddleware } from '../middleware/validation.middleware.js';
import {
  createBoardSchema,
  updateBoardSchema,
  boardIdSchema,
  listBoardsSchema,
} from '../validators/board.validator.js';
import {
  getBoardFieldConfigParamsSchema,
  updateBoardFieldConfigSchema,
} from '../validators/board-field-config.validator.js';

/**
 * Board routes
 * Defines all board-related endpoints
 * 
 * @module routes/board
 * @param {FastifyInstance} fastify - Fastify instance
 */
export async function boardRoutes(fastify) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // List boards for a project
  fastify.get(
    '/projects/:projectId/boards',
    {
      preHandler: validationMiddleware(listBoardsSchema),
      schema: {
        description: 'List all boards for a project',
        tags: ['boards'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            projectId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    boardController.listBoards
  );

  // Create board
  fastify.post(
    '/projects/:projectId/boards',
    {
      preHandler: validationMiddleware(createBoardSchema),
      schema: {
        description: 'Create a new board',
        tags: ['boards'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            projectId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 3, maxLength: 100 },
          },
        },
      },
    },
    boardController.createBoard
  );

  // Get board by ID
  fastify.get(
    '/projects/:projectId/boards/:boardId',
    {
      preHandler: validationMiddleware(boardIdSchema),
      schema: {
        description: 'Get board by ID',
        tags: ['boards'],
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
    boardController.getBoard
  );

  // Update board
  fastify.put(
    '/projects/:projectId/boards/:boardId',
    {
      preHandler: validationMiddleware(updateBoardSchema),
      schema: {
        description: 'Update board',
        tags: ['boards'],
        security: [{ bearerAuth: [] }],
      },
    },
    boardController.updateBoard
  );

  // Delete board
  fastify.delete(
    '/projects/:projectId/boards/:boardId',
    {
      preHandler: validationMiddleware(boardIdSchema),
      schema: {
        description: 'Delete board',
        tags: ['boards'],
        security: [{ bearerAuth: [] }],
      },
    },
    boardController.deleteBoard
  );

  // Add Board Member
  fastify.post(
    '/projects/:projectId/boards/:boardId/members',
    {
      preHandler: validationMiddleware(boardIdSchema),
      schema: {
        description: 'Add member to board',
        tags: ['boards'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    boardController.addMember
  );

  // Remove Board Member
  fastify.delete(
    '/projects/:projectId/boards/:boardId/members/:userId',
    {
      // No strict validation for params combination yet in existing schemas
      schema: {
        description: 'Remove member from board',
        tags: ['boards'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            projectId: { type: 'string', format: 'uuid' },
            boardId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    boardController.removeMember
  );

  // ============================================
  // Board Field Configuration Routes
  // ============================================

  // Get board field configuration
  fastify.get(
    '/boards/:boardId/config',
    {
      preHandler: validationMiddleware(getBoardFieldConfigParamsSchema),
      schema: {
        description: 'Get field configuration for a board',
        tags: ['boards', 'configuration'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            boardId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    boardFieldConfigController.getFieldConfig
  );

  // Update board field configuration
  fastify.put(
    '/boards/:boardId/config',
    {
      preHandler: validationMiddleware(updateBoardFieldConfigSchema),
      schema: {
        description: 'Update field configuration for a board',
        tags: ['boards', 'configuration'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            boardId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    boardFieldConfigController.updateFieldConfig
  );

  // Get enabled fields for a board
  fastify.get(
    '/boards/:boardId/config/enabled',
    {
      preHandler: validationMiddleware(getBoardFieldConfigParamsSchema),
      schema: {
        description: 'Get list of enabled fields for a board',
        tags: ['boards', 'configuration'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            boardId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    boardFieldConfigController.getEnabledFields
  );
  // Global Board Search
  fastify.get(
    '/boards',
    {
      schema: {
        description: 'Search boards globally',
        tags: ['boards'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            search: { type: 'string' }
          }
        }
      }
    },
    boardController.searchBoards
  );
}

