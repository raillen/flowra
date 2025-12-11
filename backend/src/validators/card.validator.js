import { z } from 'zod';

/**
 * Card validation schemas using Zod
 * 
 * @module validators/card
 */

const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Priority enum
 */
const prioritySchema = z.enum(['baixa', 'media', 'alta', 'urgente'], {
  errorMap: () => ({ message: 'Priority must be: baixa, media, alta, or urgente' }),
});

/**
 * Card type enum
 */
const cardTypeSchema = z.enum(['tarefa', 'bug', 'feature', 'melhoria', 'reuniao'], {
  errorMap: () => ({ message: 'Type must be: tarefa, bug, feature, melhoria, or reuniao' }),
});

/**
 * Card status enum
 */
const cardStatusSchema = z.enum(['novo', 'em_progresso', 'bloqueado', 'concluido'], {
  errorMap: () => ({ message: 'Status must be: novo, em_progresso, bloqueado, or concluido' }),
});

/**
 * Date transformer - converts date strings to ISO format
 */
const dateTransform = z
  .string()
  .optional()
  .nullable()
  .transform((val) => {
    if (!val || val === '') return null;
    // If it's already a datetime ISO string, return as is
    if (val.includes('T') || val.includes('Z')) {
      return val;
    }
    // If it's a date string (YYYY-MM-DD), convert to ISO datetime
    try {
      const date = new Date(val);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } catch {
      return null;
    }
  })
  .refine((val) => {
    if (val === null) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: 'Invalid date format' });

/**
 * Extended card fields schema - used for both create and update
 */
const extendedCardFieldsSchema = {
  // Basic fields
  title: z
    .string()
    .min(1, 'Card title is required')
    .max(200, 'Card title must not exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(5000, 'Description must not exceed 5000 characters')
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  priority: prioritySchema.optional(),

  // Dates
  dueDate: dateTransform,
  startDate: dateTransform,
  completedAt: dateTransform,

  // Time tracking
  estimatedHours: z.number().min(0).max(10000).optional().nullable(),
  actualHours: z.number().min(0).max(10000).optional().nullable(),
  progress: z.number().int().min(0).max(100).optional().nullable(),

  // Type and Status
  type: cardTypeSchema.optional().nullable(),
  status: cardStatusSchema.optional().nullable(),

  // Visual
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  cover: z.string().url('Invalid cover URL').optional().nullable(),

  // Business/Project
  projectPhase: z.string().max(100).optional().nullable(),
  budget: z.number().min(0).optional().nullable(),
  billable: z.boolean().optional(),
  storyPoints: z.number().int().min(0).max(100).optional().nullable(),
  externalUrl: z.string().url('Invalid external URL').optional().nullable()
    .or(z.literal('')).transform((val) => (val === '' ? null : val)),

  // Relations
  assignedUserId: uuidSchema.optional().nullable(),
  reporterId: uuidSchema.optional().nullable(),
  reviewerId: uuidSchema.optional().nullable(),
  parentCardId: uuidSchema.optional().nullable(),

  // Multiple assignees (array of user IDs)
  assigneeIds: z.array(uuidSchema).optional(),

  // Watchers (array of user IDs)
  watcherIds: z.array(uuidSchema).optional(),

  // Blocked by (array of card IDs)
  blockedByIds: z.array(uuidSchema).optional(),

  // Related to (array of card IDs)
  relatedToIds: z.array(uuidSchema).optional(),

  // Custom fields (JSON)
  customFields: z.record(z.any()).optional().nullable(),
};

/**
 * Card creation schema
 */
export const createCardSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    columnId: uuidSchema,
  }),
  body: z.object({
    ...extendedCardFieldsSchema,
    title: extendedCardFieldsSchema.title, // Title is required
  }),
});

/**
 * Card update schema
 */
export const updateCardSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    cardId: uuidSchema,
  }),
  body: z.object({
    ...extendedCardFieldsSchema,
    title: extendedCardFieldsSchema.title.optional(), // Title is optional on update
    columnId: uuidSchema.optional(),
  }),
});

/**
 * Card ID parameter schema
 */
export const cardIdSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    cardId: uuidSchema,
  }),
});

/**
 * Move card schema
 */
export const moveCardSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    cardId: uuidSchema,
  }),
  body: z.object({
    columnId: uuidSchema,
    order: z.number().int().min(0).optional(),
  }),
});

/**
 * Card assignees update schema
 */
export const updateCardAssigneesSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    cardId: uuidSchema,
  }),
  body: z.object({
    assigneeIds: z.array(uuidSchema),
  }),
});

/**
 * Card blockers update schema
 */
export const updateCardBlockersSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    cardId: uuidSchema,
  }),
  body: z.object({
    blockedByIds: z.array(uuidSchema),
  }),
});

/**
 * Card relations update schema
 */
export const updateCardRelationsSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    boardId: uuidSchema,
    cardId: uuidSchema,
  }),
  body: z.object({
    relatedToIds: z.array(uuidSchema),
  }),
});
