import * as attachmentController from '../controllers/attachment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validationMiddleware } from '../middleware/validation.middleware.js';
import {
  createAttachmentSchema,
  attachmentIdSchema,
} from '../validators/attachment.validator.js';

/**
 * Attachment routes
 * Defines all attachment-related endpoints
 * 
 * @module routes/attachment
 */
export async function attachmentRoutes(fastify) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // List attachments for a card
  fastify.get(
    '/projects/:projectId/boards/:boardId/cards/:cardId/attachments',
    {
      schema: {
        description: 'List all attachments for a card',
        tags: ['attachments'],
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
    attachmentController.listAttachments
  );

  // Create attachment
  fastify.post(
    '/projects/:projectId/boards/:boardId/cards/:cardId/attachments',
    {
      preHandler: validationMiddleware(createAttachmentSchema),
      schema: {
        description: 'Create a new attachment',
        tags: ['attachments'],
        security: [{ bearerAuth: [] }],
      },
    },
    attachmentController.createAttachment
  );

  // Delete attachment
  fastify.delete(
    '/projects/:projectId/boards/:boardId/cards/:cardId/attachments/:attachmentId',
    {
      preHandler: validationMiddleware(attachmentIdSchema),
      schema: {
        description: 'Delete attachment',
        tags: ['attachments'],
        security: [{ bearerAuth: [] }],
      },
    },
    attachmentController.deleteAttachment
  );
}

