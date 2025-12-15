import { auditLogsController } from '../controllers/auditLogsController.js';
import { authenticate } from '../middleware/auth.middleware.js';

export async function auditLogRoutes(fastify, options) {
    fastify.get('/', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'number', default: 1 },
                    limit: { type: 'number', default: 50 },
                    action: { type: 'string' },
                    entityType: { type: 'string' },
                    userId: { type: 'string' }
                }
            },
            /*
                        response: {
                            200: {
                                type: 'object',
                                properties: {
                                    data: { type: 'array', items: { type: 'object', additionalProperties: true } },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            total: { type: 'number' },
                                            page: { type: 'number' },
                                            limit: { type: 'number' },
                                            pages: { type: 'number' }
                                        }
                                    }
                                }
                            }
                            }
                        }
            */
        },
        preHandler: [authenticate] // Protect this route
    }, auditLogsController.getLogs);
}
