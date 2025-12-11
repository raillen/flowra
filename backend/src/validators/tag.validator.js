import { z } from 'zod';

/**
 * Tag validation schemas using Zod
 * 
 * @module validators/tag
 */

const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Color hex validation
 */
const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #3b82f6)')
  .optional()
  .default('#3b82f6');

/**
 * Tag creation schema
 */
export const createTagSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Tag name is required')
      .max(50, 'Tag name must not exceed 50 characters')
      .trim(),
    color: colorSchema,
  }),
});

/**
 * Tag update schema
 */
export const updateTagSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    tagId: uuidSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Tag name is required')
      .max(50, 'Tag name must not exceed 50 characters')
      .trim()
      .optional(),
    color: colorSchema,
  }),
});

/**
 * Tag ID parameter schema
 */
export const tagIdSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    tagId: uuidSchema,
  }),
});

/**
 * Add/remove tag to card schema
 */
export const cardTagSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    cardId: uuidSchema,
    tagId: uuidSchema,
  }),
});

