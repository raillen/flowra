import * as companyController from '../controllers/company.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validationMiddleware } from '../middleware/validation.middleware.js';
import {
  createCompanySchema,
  updateCompanySchema,
  companyIdSchema,
} from '../validators/company.validator.js';

/**
 * Company routes
 * Defines all company-related endpoints
 * 
 * @module routes/company
 * @param {FastifyInstance} fastify - Fastify instance
 */
export async function companyRoutes(fastify) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Create company
  fastify.post(
    '/',
    {
      preHandler: validationMiddleware(createCompanySchema),
      schema: {
        description: 'Create a new company',
        tags: ['companies'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['name', 'cnpj'],
          properties: {
            name: { type: 'string', minLength: 3, maxLength: 100 },
            legalName: { type: 'string', maxLength: 200 },
            cnpj: { type: 'string' },
            city: { type: 'string', maxLength: 100 },
            state: { type: 'string', maxLength: 2 },
            segment: { type: 'string', maxLength: 200 },
            contactName: { type: 'string', maxLength: 100 },
            contactEmail: { type: 'string', format: 'email' },
            contactPhone: { type: 'string', maxLength: 20 },
          },
        },
      },
    },
    companyController.createCompany
  );

  // List companies
  fastify.get(
    '/',
    {
      schema: {
        description: 'List all companies',
        tags: ['companies'],
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
    companyController.listCompanies
  );

  // Get company by ID
  fastify.get(
    '/:id',
    {
      preHandler: validationMiddleware(companyIdSchema),
      schema: {
        description: 'Get company by ID',
        tags: ['companies'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    companyController.getCompany
  );

  // Update company
  fastify.put(
    '/:id',
    {
      preHandler: validationMiddleware(updateCompanySchema),
      schema: {
        description: 'Update company',
        tags: ['companies'],
        security: [{ bearerAuth: [] }],
      },
    },
    companyController.updateCompany
  );

  // Delete company
  fastify.delete(
    '/:id',
    {
      preHandler: validationMiddleware(companyIdSchema),
      schema: {
        description: 'Delete company',
        tags: ['companies'],
        security: [{ bearerAuth: [] }],
      },
    },
    companyController.deleteCompany
  );
}

