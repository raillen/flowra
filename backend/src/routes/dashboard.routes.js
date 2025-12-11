import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export async function dashboardRoutes(fastify) {
    fastify.get(
        '/global',
        {
            preHandler: authenticate,
            schema: {
                description: 'Get global dashboard data',
                tags: ['dashboard'],
                security: [{ bearerAuth: [] }],
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            data: { type: 'object', additionalProperties: true }
                        }
                    }
                }
            }
        },
        dashboardController.getGlobalDashboard
    );
}
