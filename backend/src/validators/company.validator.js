import { z } from 'zod';

/**
 * Company validation schemas using Zod
 * 
 * @module validators/company
 */

const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * CNPJ validation regex (accepts formatted or unformatted)
 */
const cnpjSchema = z
  .string()
  .min(1, 'CNPJ is required')
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, 'Invalid CNPJ format. Use format: 00.000.000/0000-00 or 14 digits')
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 14, 'CNPJ must have exactly 14 digits');

/**
 * Company creation schema
 */
export const createCompanySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Company name must be at least 3 characters')
      .max(100, 'Company name must not exceed 100 characters')
      .trim(),
    legalName: z
      .string()
      .max(200, 'Legal name must not exceed 200 characters')
      .optional()
      .nullable()
      .transform((val) => (val === '' ? null : val)),
    cnpj: cnpjSchema,
    city: z
      .string()
      .max(100)
      .optional()
      .nullable()
      .transform((val) => (val === '' ? null : val)),
    state: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === '' ? null : val))
      .refine((val) => val === null || val === undefined || val.length === 2, 'State must be 2 characters'),
    segment: z
      .string()
      .max(200)
      .optional()
      .nullable()
      .transform((val) => (val === '' ? null : val)),
    contactName: z
      .string()
      .max(100)
      .optional()
      .nullable()
      .transform((val) => (val === '' ? null : val)),
    contactEmail: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === '' ? null : val))
      .refine((val) => val === null || val === undefined || z.string().email().safeParse(val).success, 'Invalid email format'),
    contactPhone: z
      .string()
      .max(20)
      .optional()
      .nullable()
      .transform((val) => (val === '' ? null : val)),
  }),
});

/**
 * Company update schema
 */
export const updateCompanySchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(3, 'Company name must be at least 3 characters')
      .max(100, 'Company name must not exceed 100 characters')
      .trim()
      .optional(),
    legalName: z.string().max(200).optional().nullable(),
    cnpj: cnpjSchema.optional(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().optional().nullable().transform((val) => (val === '' ? null : val)).refine((val) => val === null || val === undefined || val.length === 2, 'State must be 2 characters'),
    segment: z.string().max(200).optional().nullable(),
    contactName: z.string().max(100).optional().nullable(),
    contactEmail: z.string().optional().nullable().transform((val) => (val === '' ? null : val)).refine((val) => val === null || val === undefined || z.string().email().safeParse(val).success, 'Invalid email format'),
    contactPhone: z.string().max(20).optional().nullable(),
  }),
});

/**
 * Company ID parameter schema
 */
export const companyIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

