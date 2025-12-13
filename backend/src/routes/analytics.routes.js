import { getBoardSummary, getMemberWorkload, getStatusDistribution, getBurndown } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.middleware.js';

export async function analyticsRoutes(fastify, options) {
    fastify.get('/board/:boardId/summary', { preHandler: [authenticate] }, getBoardSummary);
    fastify.get('/board/:boardId/workload', { preHandler: [authenticate] }, getMemberWorkload);
    fastify.get('/board/:boardId/status', { preHandler: [authenticate] }, getStatusDistribution);
    fastify.get('/board/:boardId/burndown', { preHandler: [authenticate] }, getBurndown);
}
