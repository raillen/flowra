import { prisma } from '../config/database.js';

/**
 * Calendar Repository
 * Fetches calendar data from cards, notes, and events
 * 
 * @module repositories/calendar.repository
 */

/**
 * Get cards where user is referenced (assignee or comment author)
 * @param {string} userId - User ID
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Promise<Array>} Cards with dates
 */
export const getCardsForUser = async (userId, startDate, endDate) => {
    // Get card IDs where user commented
    const commentedCards = await prisma.comment.findMany({
        where: { userId },
        select: { cardId: true },
        distinct: ['cardId'],
    });
    const commentedCardIds = commentedCards.map(c => c.cardId);

    // Find cards where user is assigned OR has commented
    return prisma.card.findMany({
        where: {
            AND: [
                {
                    OR: [
                        { assignedUserId: userId },
                        { assignees: { some: { userId } } },
                        { id: { in: commentedCardIds } },
                    ],
                },
                {
                    OR: [
                        {
                            dueDate: {
                                gte: startDate,
                                lte: endDate,
                            },
                        },
                        {
                            startDate: {
                                gte: startDate,
                                lte: endDate,
                            },
                        },
                    ],
                },
            ],
        },
        include: {
            board: {
                select: {
                    id: true,
                    name: true,
                    project: {
                        select: { id: true, name: true },
                    },
                },
            },
            assignees: {
                include: {
                    user: {
                        select: { id: true, name: true },
                    },
                },
            },
        },
        orderBy: { dueDate: 'asc' },
    });
};

/**
 * Get notes with reminder dates for user
 * @param {string} userId - User ID
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Promise<Array>} Notes with reminders
 */
export const getNotesWithReminders = async (userId, startDate, endDate) => {
    return prisma.note.findMany({
        where: {
            userId,
            reminderDate: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: { reminderDate: 'asc' },
    });
};

/**
 * Get calendar events for user
 * @param {string} userId - User ID
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Promise<Array>} Calendar events
 */
export const getEventsForUser = async (userId, startDate, endDate) => {
    return prisma.calendarEvent.findMany({
        where: {
            userId,
            startAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: { startAt: 'asc' },
    });
};

/**
 * Create a calendar event
 * @param {Object} data - Event data
 * @returns {Promise<Object>} Created event
 */
export const createEvent = async (data) => {
    return prisma.calendarEvent.create({
        data: {
            title: data.title,
            description: data.description,
            startAt: new Date(data.startAt),
            endAt: data.endAt ? new Date(data.endAt) : null,
            allDay: data.allDay || false,
            color: data.color,
            userId: data.userId,
        },
    });
};

/**
 * Update a calendar event
 * @param {string} id - Event ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated event
 */
export const updateEvent = async (id, data) => {
    return prisma.calendarEvent.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description,
            startAt: data.startAt ? new Date(data.startAt) : undefined,
            endAt: data.endAt ? new Date(data.endAt) : undefined,
            allDay: data.allDay,
            color: data.color,
        },
    });
};

/**
 * Delete a calendar event
 * @param {string} id - Event ID
 * @returns {Promise<Object>} Deleted event
 */
export const deleteEvent = async (id) => {
    return prisma.calendarEvent.delete({
        where: { id },
    });
};

/**
 * Find event by ID
 * @param {string} id - Event ID
 * @returns {Promise<Object|null>} Event or null
 */
export const findEventById = async (id) => {
    return prisma.calendarEvent.findUnique({
        where: { id },
    });
};
