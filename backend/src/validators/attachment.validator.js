import { z } from 'zod';

/**
 * Attachment validation schemas using Zod
 * 
 * @module validators/attachment
 */

const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Attachment creation schema
 */
export const createAttachmentSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    cardId: uuidSchema,
  }),
  body: z.object({
    filename: z.string().min(1, 'Filename is required'),
    originalName: z.string().min(1, 'Original name is required'),
    mimeType: z.string().min(1, 'MIME type is required'),
    size: z.number().int().positive('Size must be positive'),
    url: z.string().url('URL must be valid'),
  }),
});

/**
 * Attachment ID parameter schema
 */
export const attachmentIdSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    cardId: uuidSchema,
    attachmentId: uuidSchema,
  }),
});

