import * as commentController from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validationMiddleware } from '../middleware/validation.middleware.js';
import {
  createCommentSchema,
  updateCommentSchema,
  commentIdSchema,
} from '../validators/comment.validator.js';

/**
 * Comment routes
 * Defines all comment-related endpoints
 * 
 * @module routes/comment
 */
export async function commentRoutes(fastify) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // List comments for a card
  fastify.get(
    '/projects/:projectId/boards/:boardId/cards/:cardId/comments',
    {
      schema: {
        description: 'List all comments for a card',
        tags: ['comments'],
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
    commentController.listComments
  );

  // Create comment
  fastify.post(
    '/projects/:projectId/boards/:boardId/cards/:cardId/comments',
    {
      preHandler: validationMiddleware(createCommentSchema),
      schema: {
        description: 'Create a new comment',
        tags: ['comments'],
        security: [{ bearerAuth: [] }],
      },
    },
    commentController.createComment
  );

  // Update comment
  fastify.put(
    '/projects/:projectId/boards/:boardId/cards/:cardId/comments/:commentId',
    {
      preHandler: validationMiddleware(updateCommentSchema),
      schema: {
        description: 'Update comment',
        tags: ['comments'],
        security: [{ bearerAuth: [] }],
      },
    },
    commentController.updateComment
  );

  // Delete comment
  fastify.delete(
    '/projects/:projectId/boards/:boardId/cards/:cardId/comments/:commentId',
    {
      preHandler: validationMiddleware(commentIdSchema),
      schema: {
        description: 'Delete comment',
        tags: ['comments'],
        security: [{ bearerAuth: [] }],
      },
    },
    commentController.deleteComment
  );

  // Add Reaction
  fastify.post(
    '/projects/:projectId/boards/:boardId/cards/:cardId/comments/:commentId/reactions',
    {
      schema: {
        description: 'Add reaction to comment',
        tags: ['comments'],
        body: {
          type: 'object',
          required: ['emoji'],
          properties: { emoji: { type: 'string' } }
        },
        security: [{ bearerAuth: [] }],
      },
    },
    commentController.addReaction
  );

  // Remove Reaction
  fastify.delete(
    '/projects/:projectId/boards/:boardId/cards/:cardId/comments/:commentId/reactions',
    {
      schema: {
        description: 'Remove reaction from comment',
        tags: ['comments'],
        body: {
          type: 'object',
          required: ['emoji'],
          properties: { emoji: { type: 'string' } }
        },
        security: [{ bearerAuth: [] }],
      },
    },
    commentController.removeReaction
  );
}

