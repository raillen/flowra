import * as notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

/**
 * Notification Routes
 * API endpoints for notifications
 * 
 * @module routes/notification.routes
 */

export async function notificationRoutes(fastify) {
    fastify.addHook('preHandler', authenticate);

    // GET /api/notifications
    fastify.get('/notifications', {
        schema: {
            description: 'Get user notifications',
            tags: ['Notifications'],
            querystring: {
                type: 'object',
                properties: {
                    unreadOnly: { type: 'string' },
                    limit: { type: 'integer' },
                },
            },
        },
        handler: notificationController.getNotifications,
    });

    // PUT /api/notifications/:id/read
    fastify.put('/notifications/:id/read', {
        schema: {
            description: 'Mark notification as read',
            tags: ['Notifications'],
        },
        handler: notificationController.markAsRead,
    });

    // PUT /api/notifications/read-all
    fastify.put('/notifications/read-all', {
        schema: {
            description: 'Mark all notifications as read',
            tags: ['Notifications'],
        },
        handler: notificationController.markAllAsRead,
    });

    // DELETE /api/notifications/:id
    fastify.delete('/notifications/:id', {
        schema: {
            description: 'Delete a notification',
            tags: ['Notifications'],
        },
        handler: notificationController.deleteNotification,
    });
}
