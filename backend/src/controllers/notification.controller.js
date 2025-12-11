import * as notificationService from '../services/notification.service.js';

/**
 * Notification Controller
 * HTTP handlers for notifications
 * 
 * @module controllers/notification.controller
 */

/**
 * Get notifications for user
 */
export const getNotifications = async (request, reply) => {
    const result = await notificationService.getNotifications(request.user.id, {
        unreadOnly: request.query.unreadOnly === 'true',
        limit: parseInt(request.query.limit) || 50,
    });

    return reply.send({
        success: true,
        data: result,
    });
};

/**
 * Mark notification as read
 */
export const markAsRead = async (request, reply) => {
    await notificationService.markAsRead(request.params.id, request.user.id);

    return reply.send({
        success: true,
        message: 'Notification marked as read',
    });
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (request, reply) => {
    await notificationService.markAllAsRead(request.user.id);

    return reply.send({
        success: true,
        message: 'All notifications marked as read',
    });
};

/**
 * Delete notification
 */
export const deleteNotification = async (request, reply) => {
    await notificationService.deleteNotification(request.params.id, request.user.id);

    return reply.send({
        success: true,
        message: 'Notification deleted',
    });
};
