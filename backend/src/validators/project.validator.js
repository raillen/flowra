import { z } from 'zod';

/**
 * Project validation schemas using Zod
 * 
 * @module validators/project
 */

/**
 * UUID validation schema
 */
const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Project creation schema
 */
export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Project name must be at least 3 characters')
      .max(100, 'Project name must not exceed 100 characters')
      .trim(),
    description: z
      .string()
      .max(500, 'Description must not exceed 500 characters')
      .optional()
      .nullable(),
    companyId: uuidSchema.optional().nullable(),
    groupId: uuidSchema.optional().nullable(),
  }),
});

/**
 * Project update schema
 */
export const updateProjectSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(3, 'Project name must be at least 3 characters')
      .max(100, 'Project name must not exceed 100 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, 'Description must not exceed 500 characters')
      .optional()
      .nullable(),
    companyId: uuidSchema.optional().nullable(),
    groupId: uuidSchema.optional().nullable(),
  }),
});

/**
 * Project ID parameter schema
 */
export const projectIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

/**
 * Project list query schema
 */
export const listProjectsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .pipe(z.number().int().positive())
      .optional()
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .pipe(z.number().int().positive().max(100))
      .optional()
      .default('10'),
  }),
});

