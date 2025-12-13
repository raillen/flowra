import * as notificationRepository from '../repositories/notification.repository.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { emitToUser } from '../config/socket.js';

/**
 * Notification Service
 * Business logic for notifications
 * 
 * @module services/notification.service
 */

/**
 * Get notifications for user
 */
export const getNotifications = async (userId, options = {}) => {
    // Generate any new card and event notifications
    await notificationRepository.generateCardNotifications(userId);
    await notificationRepository.generateEventNotifications(userId);

    // Get all notifications
    const notifications = await notificationRepository.findByUserId(userId, options);
    const unreadCount = await notificationRepository.countUnread(userId);

    return {
        notifications,
        unreadCount,
    };
};

/**
 * Create notification
 */
export const createNotification = async (data) => {
    const notification = await notificationRepository.create(data);

    // Emit real-time notification
    emitToUser(data.userId, 'notification:new', notification);

    return notification;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id, userId) => {
    const notification = await notificationRepository.findById(id);

    if (!notification) {
        throw new NotFoundError('Notification not found');
    }

    if (notification.userId !== userId) {
        throw new ForbiddenError('Access denied');
    }

    const updated = await notificationRepository.markAsRead(id);
    const unreadCount = await notificationRepository.countUnread(userId);

    // Emit update
    emitToUser(userId, 'notification:update', {
        id,
        read: true,
        unreadCount
    });

    return updated;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId) => {
    const result = await notificationRepository.markAllAsRead(userId);

    // Emit update
    emitToUser(userId, 'notification:read_all', { unreadCount: 0 });

    return result;
};

/**
 * Delete notification
 */
export const deleteNotification = async (id, userId) => {
    const notification = await notificationRepository.findById(id);

    if (!notification) {
        throw new NotFoundError('Notification not found');
    }

    if (notification.userId !== userId) {
        throw new ForbiddenError('Access denied');
    }

    return notificationRepository.deleteNotification(id);
};

/**
 * Create notification for mention
 */
export const notifyMention = async (mentionedUserId, actorName, cardTitle, cardId) => {
    return createNotification({
        type: 'mention',
        title: 'Você foi mencionado',
        message: `${actorName} mencionou você em "${cardTitle}"`,
        userId: mentionedUserId,
        refType: 'card',
        refId: cardId,
        priority: 'normal',
    });
};

/**
 * Create notification for assignment
 */
export const notifyAssignment = async (assignedUserId, actorName, cardTitle, cardId) => {
    return createNotification({
        type: 'assigned',
        title: 'Card Atribuído',
        message: `${actorName} atribuiu "${cardTitle}" a você`,
        userId: assignedUserId,
        refType: 'card',
        refId: cardId,
        priority: 'normal',
    });
};

/**
 * Send email notification (Stub)
 */
export const sendEmailNotification = async (to, subject, content) => {
    // TODO: Implement email sending logic (e.g. via Resend, SendGrid, or SMTP)
    console.log(`[Email Stub] To: ${to}, Subject: ${subject}`);
    return true;
};
