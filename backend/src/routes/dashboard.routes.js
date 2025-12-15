import { dashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.middleware.js';

export async function dashboardRoutes(fastify, options) {
    fastify.get('/global', {
        schema: {
            description: 'Get global dashboard statistics',
            tags: ['dashboard'],
            security: [{ bearerAuth: [] }],
            /*
                        response: {
                            200: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            stats: { type: 'object' },
                                            tasks: { type: 'object' },
                                            metrics: { type: 'object' },
                                            recentActivity: { type: 'array' },
                                            upcomingEvents: { type: 'array' }
                                        }
                                    }
                                }
                            }
                            }
                        }
            */
        },
        preHandler: [authenticate]
    }, dashboardController.getGlobalStats);
}
