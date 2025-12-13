import { z } from 'zod';

/**
 * Authentication validation schemas using Zod
 * 
 * @module validators/auth
 */

/**
 * User registration schema
 */
export const registerSchema = z.object({
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
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must not exceed 100 characters'),
    companyName: z
      .string()
      .min(3, 'Company Name must be at least 3 characters')
      .max(100)
      .optional(),
  }),
});

/**
 * User login schema
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
    password: z.string().min(1, 'Password is required'),
  }),
});

/**
 * User profile update schema
 */
export const updateProfileSchema = z.object({
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
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must not exceed 100 characters')
      .optional(),
  }).refine(
    (data) => {
      // If newPassword is provided, currentPassword must also be provided
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    { message: 'Current password is required to change password' }
  ),
});
