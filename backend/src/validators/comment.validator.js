import { z } from 'zod';

/**
 * Comment validation schemas using Zod
 * 
 * @module validators/comment
 */

const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Comment creation schema
 */
export const createCommentSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    cardId: uuidSchema,
  }),
  body: z.object({
    content: z
      .string()
      .min(1, 'Comment content is required')
      .max(1000, 'Comment must not exceed 1000 characters')
      .trim(),
  }),
});

/**
 * Comment update schema
 */
export const updateCommentSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    cardId: uuidSchema,
    commentId: uuidSchema,
  }),
  body: z.object({
    content: z
      .string()
      .min(1, 'Comment content is required')
      .max(1000, 'Comment must not exceed 1000 characters')
      .trim(),
  }),
});

/**
 * Comment ID parameter schema
 */
export const commentIdSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    cardId: uuidSchema,
    commentId: uuidSchema,
  }),
});

