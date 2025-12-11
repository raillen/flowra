import * as collaboratorController from '../controllers/collaborator.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validationMiddleware } from '../middleware/validation.middleware.js';
import {
  createCollaboratorSchema,
  updateCollaboratorSchema,
  collaboratorIdSchema,
  listCollaboratorsSchema,
} from '../validators/collaborator.validator.js';

/**
 * Collaborator routes
 * Defines all collaborator-related endpoints
 * 
 * @module routes/collaborator
 * @param {FastifyInstance} fastify - Fastify instance
 */
export async function collaboratorRoutes(fastify) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Create collaborator
  fastify.post(
    '/',
    {
      preHandler: validationMiddleware(createCollaboratorSchema),
      schema: {
        description: 'Create a new collaborator',
        tags: ['collaborators'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', minLength: 3, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            employeeId: { type: 'string', maxLength: 50 },
            pis: { type: 'string', maxLength: 20 },
            status: { type: 'string', enum: ['Ativo', 'Férias', 'Inativo'] },
            companyIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
            groupIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          },
        },
      },
    },
    collaboratorController.createCollaborator
  );

  // List collaborators
  fastify.get(
    '/',
    {
      preHandler: validationMiddleware(listCollaboratorsSchema),
      schema: {
        description: 'List all collaborators',
        tags: ['collaborators'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
          },
        },
      },
    },
    collaboratorController.listCollaborators
  );

  // Get collaborator by ID
  fastify.get(
    '/:id',
    {
      preHandler: validationMiddleware(collaboratorIdSchema),
      schema: {
        description: 'Get collaborator by ID',
        tags: ['collaborators'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    collaboratorController.getCollaborator
  );

  // Update collaborator
  fastify.put(
    '/:id',
    {
      preHandler: validationMiddleware(updateCollaboratorSchema),
      schema: {
        description: 'Update collaborator',
        tags: ['collaborators'],
        security: [{ bearerAuth: [] }],
      },
    },
    collaboratorController.updateCollaborator
  );

  // Delete collaborator
  fastify.delete(
    '/:id',
    {
      preHandler: validationMiddleware(collaboratorIdSchema),
      schema: {
        description: 'Delete collaborator',
        tags: ['collaborators'],
        security: [{ bearerAuth: [] }],
      },
    },
    collaboratorController.deleteCollaborator
  );
}

