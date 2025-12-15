import * as automationController from '../controllers/automation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

/**
 * Automation routes
 * Defines all automation-related endpoints
 */
export async function automationRoutes(fastify) {
    // All routes require authentication
    fastify.addHook('onRequest', authenticate);

    // List rules for a board
    fastify.get(
        '/boards/:boardId/automation/rules',
        {
            schema: {
                description: 'List automation rules for a board',
                tags: ['automation'],
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    properties: {
                        boardId: { type: 'string', format: 'uuid' },
                    },
                },
            },
        },
        automationController.listRules
    );

    // Create rule
    fastify.post(
        '/boards/:boardId/automation/rules',
        {
            schema: {
                description: 'Create a new automation rule',
                tags: ['automation'],
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    properties: {
                        boardId: { type: 'string', format: 'uuid' },
                    },
                },
                body: {
                    type: 'object',
                    required: ['triggerType', 'actions'],
                    properties: {
                        name: { type: 'string' },
                        triggerType: { type: 'string' },
                        conditions: { type: ['object', 'string'] },
                        actions: { type: ['array', 'string'] },
                        cronExpression: { type: 'string' },
                        isActive: { type: 'boolean' }
                    }
                }
            },
        },
        automationController.createRule
    );

    // Get rule
    fastify.get(
        '/automation/rules/:ruleId',
        {
            schema: {
                description: 'Get automation rule by ID',
                tags: ['automation'],
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    properties: {
                        ruleId: { type: 'string', format: 'uuid' },
                    },
                },
            },
        },
        automationController.getRule
    );

    // Update rule
    fastify.put(
        '/automation/rules/:ruleId',
        {
            schema: {
                description: 'Update automation rule',
                tags: ['automation'],
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    properties: {
                        ruleId: { type: 'string', format: 'uuid' },
                    },
                },
            },
        },
        automationController.updateRule
    );

    // Delete rule
    fastify.delete(
        '/automation/rules/:ruleId',
        {
            schema: {
                description: 'Delete automation rule',
                tags: ['automation'],
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    properties: {
                        ruleId: { type: 'string', format: 'uuid' },
                    },
                },
            },
        },
        automationController.deleteRule
    );
}
