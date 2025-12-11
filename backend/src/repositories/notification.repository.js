import { prisma } from '../config/database.js';

/**
 * Notification Repository
 * Database operations for notifications
 * 
 * @module repositories/notification.repository
 */

/**
 * Get notifications for user
 */
export const findByUserId = async (userId, { unreadOnly = false, limit = 50 } = {}) => {
    return prisma.notification.findMany({
        where: {
            userId,
            ...(unreadOnly ? { read: false } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
};

/**
 * Count unread notifications
 */
export const countUnread = async (userId) => {
    return prisma.notification.count({
        where: { userId, read: false },
    });
};

/**
 * Create notification
 */
export const create = async (data) => {
    return prisma.notification.create({
        data: {
            type: data.type,
            title: data.title,
            message: data.message,
            userId: data.userId,
            refType: data.refType,
            refId: data.refId,
            priority: data.priority || 'normal',
        },
    });
};

/**
 * Create many notifications
 */
export const createMany = async (notifications) => {
    return prisma.notification.createMany({
        data: notifications,
        skipDuplicates: true,
    });
};

/**
 * Mark as read
 */
export const markAsRead = async (id) => {
    return prisma.notification.update({
        where: { id },
        data: { read: true },
    });
};

/**
 * Mark all as read for user
 */
export const markAllAsRead = async (userId) => {
    return prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
    });
};

/**
 * Delete notification
 */
export const deleteNotification = async (id) => {
    return prisma.notification.delete({
        where: { id },
    });
};

/**
 * Delete old notifications (cleanup)
 */
export const deleteOldNotifications = async (daysOld = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return prisma.notification.deleteMany({
        where: {
            createdAt: { lt: cutoffDate },
            read: true,
        },
    });
};

/**
 * Check for overdue cards and create notifications
 */
export const generateCardNotifications = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    // Get cards where user is assigned
    const cards = await prisma.card.findMany({
        where: {
            OR: [
                { assignedUserId: userId },
                { assignees: { some: { userId } } },
            ],
            dueDate: { not: null },
        },
        include: {
            board: { select: { name: true, project: { select: { name: true } } } },
        },
    });

    const notifications = [];

    for (const card of cards) {
        const dueDate = new Date(card.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        // Check if notification already exists today for this card
        const existingToday = await prisma.notification.findFirst({
            where: {
                userId,
                refType: 'card',
                refId: card.id,
                createdAt: { gte: today },
            },
        });

        if (existingToday) continue;

        if (dueDate < today) {
            // Overdue
            notifications.push({
                type: 'card_overdue',
                title: 'Card Atrasado',
                message: `"${card.title}" está atrasado`,
                userId,
                refType: 'card',
                refId: card.id,
                priority: 'urgent',
            });
        } else if (dueDate.getTime() === today.getTime()) {
            // Due today
            notifications.push({
                type: 'card_due_today',
                title: 'Card Vence Hoje',
                message: `"${card.title}" vence hoje`,
                userId,
                refType: 'card',
                refId: card.id,
                priority: 'high',
            });
        } else if (dueDate.getTime() === tomorrow.getTime()) {
            // Due tomorrow
            notifications.push({
                type: 'card_due_tomorrow',
                title: 'Card Vence Amanhã',
                message: `"${card.title}" vence amanhã`,
                userId,
                refType: 'card',
                refId: card.id,
                priority: 'normal',
            });
        }
    }

    if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
    }

    return notifications.length;
};

/**
 * Generate notifications for upcoming calendar events (within 15 min)
 */
export const generateEventNotifications = async (userId) => {
    const now = new Date();
    const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);

    // Get events starting in the next 15 minutes
    const events = await prisma.calendarEvent.findMany({
        where: {
            userId,
            startAt: {
                gte: now,
                lte: in15Minutes,
            },
        },
    });

    const notifications = [];

    for (const event of events) {
        // Check if notification already exists for this event
        const existing = await prisma.notification.findFirst({
            where: {
                userId,
                refType: 'event',
                refId: event.id,
                type: 'event_soon',
            },
        });

        if (existing) continue;

        const minutesUntil = Math.round((new Date(event.startAt) - now) / 60000);

        notifications.push({
            type: 'event_soon',
            title: 'Evento em Breve',
            message: `"${event.title}" começa em ${minutesUntil} minutos`,
            userId,
            refType: 'event',
            refId: event.id,
            priority: 'high',
        });
    }

    if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
    }

    return notifications.length;
};

/**
 * Find by ID
 */
export const findById = async (id) => {
    return prisma.notification.findUnique({
        where: { id },
    });
};

