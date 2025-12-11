import { z } from 'zod';

/**
 * Board validation schemas using Zod
 * 
 * @module validators/board
 */

const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Board creation schema
 */
export const createBoardSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(3, 'Board name must be at least 3 characters')
      .max(100, 'Board name must not exceed 100 characters')
      .trim(),
  }),
});

/**
 * Board update schema
 */
export const updateBoardSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(3, 'Board name must be at least 3 characters')
      .max(100, 'Board name must not exceed 100 characters')
      .trim()
      .optional(),
  }),
});

/**
 * Board ID parameter schema
 */
export const boardIdSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
  }),
});

/**
 * Board list query schema
 */
export const listBoardsSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
  }),
});

