import { z } from 'zod';

/**
 * Collaborator validation schemas using Zod
 * 
 * @module validators/collaborator
 */

const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Collaborator creation schema
 */
export const createCollaboratorSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim(),
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
    employeeId: z.string().max(50).optional().nullable(),
    pis: z.string().max(20).optional().nullable(),
    status: z.enum(['Ativo', 'Férias', 'Inativo']).default('Ativo'),
    companyIds: z.array(uuidSchema).optional().default([]),
    groupIds: z.array(uuidSchema).optional().default([]),
  }),
});

/**
 * Collaborator update schema
 */
export const updateCollaboratorSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .trim()
      .optional(),
    employeeId: z.string().max(50).optional().nullable(),
    pis: z.string().max(20).optional().nullable(),
    status: z.enum(['Ativo', 'Férias', 'Inativo']).optional(),
    companyIds: z.array(uuidSchema).optional(),
    groupIds: z.array(uuidSchema).optional(),
  }),
});

/**
 * Collaborator ID parameter schema
 */
export const collaboratorIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

/**
 * Collaborator list query schema
 */
export const listCollaboratorsSchema = z.object({
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

