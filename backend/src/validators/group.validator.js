import { z } from 'zod';

/**
 * Group validation schemas using Zod
 * 
 * @module validators/group
 */

const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Group creation schema
 */
export const createGroupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Group name must be at least 3 characters')
      .max(100, 'Group name must not exceed 100 characters')
      .trim(),
  }),
});

/**
 * Group update schema
 */
export const updateGroupSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(3, 'Group name must be at least 3 characters')
      .max(100, 'Group name must not exceed 100 characters')
      .trim(),
  }),
});

/**
 * Group ID parameter schema
 */
export const groupIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

