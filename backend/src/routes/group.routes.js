import * as groupController from '../controllers/group.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validationMiddleware } from '../middleware/validation.middleware.js';
import {
  createGroupSchema,
  updateGroupSchema,
  groupIdSchema,
} from '../validators/group.validator.js';

/**
 * Group routes
 * Defines all group-related endpoints
 * 
 * @module routes/group
 * @param {FastifyInstance} fastify - Fastify instance
 */
export async function groupRoutes(fastify) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Create group
  fastify.post(
    '/',
    {
      preHandler: validationMiddleware(createGroupSchema),
      schema: {
        description: 'Create a new group',
        tags: ['groups'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 3, maxLength: 100 },
          },
        },
      },
    },
    groupController.createGroup
  );

  // List groups
  fastify.get(
    '/',
    {
      schema: {
        description: 'List all groups',
        tags: ['groups'],
        security: [{ bearerAuth: [] }],
      },
    },
    groupController.listGroups
  );

  // Get group by ID
  fastify.get(
    '/:id',
    {
      preHandler: validationMiddleware(groupIdSchema),
      schema: {
        description: 'Get group by ID',
        tags: ['groups'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    groupController.getGroup
  );

  // Update group
  fastify.put(
    '/:id',
    {
      preHandler: validationMiddleware(updateGroupSchema),
      schema: {
        description: 'Update group',
        tags: ['groups'],
        security: [{ bearerAuth: [] }],
      },
    },
    groupController.updateGroup
  );

  // Delete group
  fastify.delete(
    '/:id',
    {
      preHandler: validationMiddleware(groupIdSchema),
      schema: {
        description: 'Delete group',
        tags: ['groups'],
        security: [{ bearerAuth: [] }],
      },
    },
    groupController.deleteGroup
  );
}

