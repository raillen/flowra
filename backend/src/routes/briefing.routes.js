import { authenticate } from '../middleware/auth.middleware.js';
import * as briefingController from '../controllers/briefing.controller.js';

/**
 * Briefing routes
 * Defines all briefing-related endpoints
 * 
 * @module routes/briefing
 * @param {FastifyInstance} fastify - Fastify instance
 */
export async function briefingRoutes(fastify) {
    // Public routes (no auth needed)
    fastify.get('/public/:token', briefingController.getPublicTemplate);
    fastify.post('/public/:token/submit', briefingController.submitPublicBriefing);

    // Protected routes group
    fastify.register(async function (protectedRoutes) {
        protectedRoutes.addHook('onRequest', authenticate);

        protectedRoutes.post('/templates', briefingController.createTemplate);
        protectedRoutes.put('/templates/:id', briefingController.updateTemplate);
        protectedRoutes.delete('/templates/:id', briefingController.deleteTemplate);
        protectedRoutes.get('/templates', briefingController.listTemplates);
        protectedRoutes.get('/templates/:id', briefingController.getTemplate);

        protectedRoutes.post('/cards/:cardId/submit', briefingController.submitBriefing);
        protectedRoutes.get('/cards/:cardId/history', briefingController.getBriefingHistory);
        protectedRoutes.get('/submissions', briefingController.listSubmissions);
    });
}

export default briefingRoutes;
