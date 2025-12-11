import * as calendarRepository from '../repositories/calendar.repository.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

/**
 * Calendar Service
 * Business logic for calendar
 * 
 * @module services/calendar.service
 */

/**
 * Get all calendar items for user
 * @param {string} userId - User ID
 * @param {string} startDate - Start date ISO string
 * @param {string} endDate - End date ISO string
 * @returns {Promise<Object>} Calendar items grouped by type
 */
export const getCalendarItems = async (userId, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch all types in parallel
    const [cards, notes, events] = await Promise.all([
        calendarRepository.getCardsForUser(userId, start, end),
        calendarRepository.getNotesWithReminders(userId, start, end),
        calendarRepository.getEventsForUser(userId, start, end),
    ]);

    // Transform cards to calendar format
    const cardItems = cards.map(card => ({
        id: card.id,
        type: 'card',
        title: card.title,
        date: card.dueDate,
        startDate: card.startDate,
        endDate: card.dueDate,
        priority: card.priority,
        status: card.status,
        boardId: card.board?.id,
        boardName: card.board?.name,
        projectId: card.board?.project?.id,
        projectName: card.board?.project?.name,
        color: getPriorityColor(card.priority),
    }));

    // Transform notes to calendar format
    const noteItems = notes.map(note => ({
        id: note.id,
        type: 'note',
        title: note.title,
        date: note.reminderDate,
        color: '#f59e0b', // Amber
    }));

    // Transform events to calendar format
    const eventItems = events.map(event => ({
        id: event.id,
        type: 'event',
        title: event.title,
        description: event.description,
        date: event.startAt,
        startDate: event.startAt,
        endDate: event.endAt,
        allDay: event.allDay,
        color: event.color || '#3b82f6', // Blue
    }));

    return {
        cards: cardItems,
        notes: noteItems,
        events: eventItems,
        all: [...cardItems, ...noteItems, ...eventItems].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        ),
    };
};

/**
 * Create a calendar event
 * @param {Object} data - Event data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created event
 */
export const createEvent = async (data, userId) => {
    return calendarRepository.createEvent({
        ...data,
        userId,
    });
};

/**
 * Update a calendar event
 * @param {string} id - Event ID
 * @param {Object} data - Update data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated event
 */
export const updateEvent = async (id, data, userId) => {
    const event = await calendarRepository.findEventById(id);

    if (!event) {
        throw new NotFoundError('Event not found');
    }

    if (event.userId !== userId) {
        throw new ForbiddenError('Access denied');
    }

    return calendarRepository.updateEvent(id, data);
};

/**
 * Delete a calendar event
 * @param {string} id - Event ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deleted event
 */
export const deleteEvent = async (id, userId) => {
    const event = await calendarRepository.findEventById(id);

    if (!event) {
        throw new NotFoundError('Event not found');
    }

    if (event.userId !== userId) {
        throw new ForbiddenError('Access denied');
    }

    return calendarRepository.deleteEvent(id);
};

/**
 * Get color based on priority
 * @param {string} priority - Priority level
 * @returns {string} Hex color
 */
const getPriorityColor = (priority) => {
    const colors = {
        urgent: '#ef4444',   // Red
        alta: '#f97316',     // Orange
        media: '#3b82f6',    // Blue
        baixa: '#22c55e',    // Green
    };
    return colors[priority] || '#6b7280'; // Gray default
};
