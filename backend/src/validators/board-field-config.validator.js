import { z } from 'zod';

/**
 * Board field configuration validation schemas
 * 
 * @module validators/boardFieldConfig
 */

/**
 * Field configuration schema for a single field
 */
const fieldConfigItemSchema = z.object({
    enabled: z.boolean().default(false),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(), // For select/enum fields
});

/**
 * Custom field definition schema
 */
const customFieldDefinitionSchema = z.object({
    name: z.string().min(1, 'Field name is required'),
    type: z.enum(['text', 'number', 'boolean', 'select', 'date', 'url']),
    options: z.array(z.string()).optional(), // For select type
    required: z.boolean().default(false),
    defaultValue: z.any().optional(),
});

/**
 * Complete board field configuration schema
 */
const fieldsConfigSchema = z.object({
    // Time and Progress fields
    startDate: fieldConfigItemSchema.optional(),
    completedAt: fieldConfigItemSchema.optional(),
    estimatedHours: fieldConfigItemSchema.optional(),
    actualHours: fieldConfigItemSchema.optional(),
    progress: fieldConfigItemSchema.optional(),

    // Collaboration fields
    assignees: fieldConfigItemSchema.optional(),
    reporter: fieldConfigItemSchema.optional(),
    reviewer: fieldConfigItemSchema.optional(),
    watchers: fieldConfigItemSchema.optional(),

    // Organization fields
    type: z.object({
        enabled: z.boolean().default(false),
        required: z.boolean().default(false),
        options: z.array(z.string()).default(['tarefa', 'bug', 'feature', 'melhoria', 'reuniao']),
    }).optional(),
    status: z.object({
        enabled: z.boolean().default(false),
        required: z.boolean().default(false),
        options: z.array(z.string()).default(['novo', 'em_progresso', 'bloqueado', 'concluido']),
    }).optional(),
    subtasks: fieldConfigItemSchema.optional(),
    blockedBy: fieldConfigItemSchema.optional(),
    relatedTo: fieldConfigItemSchema.optional(),

    // Visual fields
    color: fieldConfigItemSchema.optional(),
    icon: fieldConfigItemSchema.optional(),
    cover: fieldConfigItemSchema.optional(),

    // Business fields
    projectPhase: z.object({
        enabled: z.boolean().default(false),
        required: z.boolean().default(false),
        options: z.array(z.string()).default(['discovery', 'design', 'development', 'testing', 'deployment']),
    }).optional(),
    budget: fieldConfigItemSchema.optional(),
    billable: fieldConfigItemSchema.optional(),
    storyPoints: fieldConfigItemSchema.optional(),
    externalUrl: fieldConfigItemSchema.optional(),

    // Custom fields
    customFields: z.object({
        enabled: z.boolean().default(false),
        definitions: z.array(customFieldDefinitionSchema).default([]),
    }).optional(),
});

/**
 * Get board field config params schema
 */
export const getBoardFieldConfigParamsSchema = z.object({
    params: z.object({
        boardId: z.string().uuid('Invalid board ID'),
    }),
});

/**
 * Update board field config schema
 */
export const updateBoardFieldConfigSchema = z.object({
    params: z.object({
        boardId: z.string().uuid('Invalid board ID'),
    }),
    body: z.object({
        fields: fieldsConfigSchema,
    }),
});

/**
 * Default field configuration for new boards
 */
export const defaultFieldConfig = {
    // Only basic fields enabled by default
    startDate: { enabled: false, required: false },
    completedAt: { enabled: false, required: false },
    estimatedHours: { enabled: false, required: false },
    actualHours: { enabled: false, required: false },
    progress: { enabled: false, required: false },
    assignees: { enabled: false, required: false },
    reporter: { enabled: false, required: false },
    reviewer: { enabled: false, required: false },
    watchers: { enabled: false, required: false },
    type: { enabled: false, required: false, options: ['tarefa', 'bug', 'feature', 'melhoria', 'reuniao'] },
    status: { enabled: false, required: false, options: ['novo', 'em_progresso', 'bloqueado', 'concluido'] },
    subtasks: { enabled: false, required: false },
    blockedBy: { enabled: false, required: false },
    relatedTo: { enabled: false, required: false },
    color: { enabled: false, required: false },
    icon: { enabled: false, required: false },
    cover: { enabled: false, required: false },
    projectPhase: { enabled: false, required: false, options: ['discovery', 'design', 'development', 'testing', 'deployment'] },
    budget: { enabled: false, required: false },
    billable: { enabled: false, required: false },
    storyPoints: { enabled: false, required: false },
    externalUrl: { enabled: false, required: false },
    customFields: { enabled: false, definitions: [] },
};
