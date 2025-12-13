import { z } from 'zod';

/**
 * Column validation schemas using Zod
 * 
 * @module validators/column
 */

const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Column creation schema
 */
export const createColumnSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
  }),
  body: z.object({
    title: z
      .string()
      .min(1, 'Column title is required')
      .max(100, 'Column title must not exceed 100 characters')
      .trim(),
    color: z
      .string()
      .max(50)
      .optional()
      .default('bg-slate-100'),
    order: z.number().int().min(0).optional(),
    autoArchive: z.boolean().optional().default(false),
    archiveAfterMinutes: z.number().int().min(0).nullable().optional(),
  }),
});

/**
 * Column update schema
 */
export const updateColumnSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    columnId: uuidSchema,
  }),
  body: z.object({
    title: z
      .string()
      .min(1, 'Column title is required')
      .max(100, 'Column title must not exceed 100 characters')
      .trim()
      .optional(),
    color: z.string().max(50).optional(),
    order: z.number().int().min(0).optional(),
    autoArchive: z.boolean().optional(),
    archiveAfterMinutes: z.number().int().min(0).nullable().optional(),
  }),
});

/**
 * Column ID parameter schema
 */
export const columnIdSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    columnId: uuidSchema,
  }),
});

/**
 * Update column order schema
 */
export const updateColumnOrderSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
  }),
  body: z.object({
    columns: z.array(
      z.object({
        id: uuidSchema,
        order: z.number().int().min(0),
      })
    ),
  }),
});

