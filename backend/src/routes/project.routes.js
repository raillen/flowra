import * as projectController from '../controllers/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validationMiddleware } from '../middleware/validation.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  listProjectsSchema,
} from '../validators/project.validator.js';

/**
 * Project routes
 * Defines all project-related endpoints
 * 
 * @module routes/project
 * @param {FastifyInstance} fastify - Fastify instance
 */
export async function projectRoutes(fastify) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Create project
  fastify.post(
    '/',
    {
      preHandler: validationMiddleware(createProjectSchema),
      schema: {
        description: 'Create a new project',
        tags: ['projects'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 3, maxLength: 100 },
            description: { type: 'string', maxLength: 500 },
            companyId: { type: 'string', format: 'uuid' },
            groupId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    projectController.createProject
  );

  // List projects
  fastify.get(
    '/',
    {
      preHandler: validationMiddleware(listProjectsSchema),
      schema: {
        description: 'List all projects for authenticated user',
        tags: ['projects'],
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
    projectController.listProjects
  );

  // Get project by ID
  fastify.get(
    '/:id',
    {
      preHandler: validationMiddleware(projectIdSchema),
      schema: {
        description: 'Get project by ID',
        tags: ['projects'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    projectController.getProject
  );

  // Update project
  fastify.put(
    '/:id',
    {
      preHandler: validationMiddleware(updateProjectSchema),
      schema: {
        description: 'Update project',
        tags: ['projects'],
        security: [{ bearerAuth: [] }],
      },
    },
    projectController.updateProject
  );

  // Delete project
  fastify.delete(
    '/:id',
    {
      preHandler: validationMiddleware(projectIdSchema),
      schema: {
        description: 'Delete project',
        tags: ['projects'],
        security: [{ bearerAuth: [] }],
      },
    },
    projectController.deleteProject
  );

  // Add Project Member
  fastify.post(
    '/:id/members',
    {
      preHandler: validationMiddleware(projectIdSchema),
      schema: {
        description: 'Add member to project',
        tags: ['projects'],
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
    projectController.addMember
  );

  // Remove Project Member
  fastify.delete(
    '/:id/members/:userId',
    {
      // Reusing projectIdSchema for :id but we have extra :userId param
      // Better to define custom validation or skip middleware for this specific route 
      // and let controller handle or define schema properly inline.
      // Actually projectIdSchema validates params.id.
      // We need to validate params.userId too.
      schema: {
        description: 'Remove member from project',
        tags: ['projects'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    projectController.removeMember
  );
}

