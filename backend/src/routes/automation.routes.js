import * as automationController from '../controllers/automation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

/**
 * Automation routes
 * Defines endpoints for managing automation rules
 * 
 * @module routes/automation
 * @param {FastifyInstance} fastify - Fastify instance
 */
export async function automationRoutes(fastify) {
    // All routes require authentication
    fastify.addHook('onRequest', authenticate);

    // List rules
    fastify.get('/boards/:boardId/automations', automationController.getRules);

    // Create rule
    fastify.post('/boards/:boardId/automations', automationController.createRule);

    // Delete rule
    fastify.delete('/automations/:ruleId', automationController.deleteRule);
}
