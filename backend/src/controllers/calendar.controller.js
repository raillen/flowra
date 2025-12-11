import * as calendarService from '../services/calendar.service.js';

/**
 * Calendar Controller
 * HTTP handlers for calendar endpoints
 * 
 * @module controllers/calendar.controller
 */

/**
 * Get all calendar items for user
 */
export const getCalendarItems = async (request, reply) => {
    const { startDate, endDate } = request.query;

    if (!startDate || !endDate) {
        return reply.status(400).send({
            success: false,
            message: 'startDate and endDate are required',
        });
    }

    const items = await calendarService.getCalendarItems(
        request.user.id,
        startDate,
        endDate
    );

    return reply.send({
        success: true,
        data: items,
    });
};

/**
 * Create a calendar event
 */
export const createEvent = async (request, reply) => {
    const event = await calendarService.createEvent(
        request.body,
        request.user.id
    );

    return reply.status(201).send({
        success: true,
        data: event,
        message: 'Event created successfully',
    });
};

/**
 * Update a calendar event
 */
export const updateEvent = async (request, reply) => {
    const event = await calendarService.updateEvent(
        request.params.id,
        request.body,
        request.user.id
    );

    return reply.send({
        success: true,
        data: event,
        message: 'Event updated successfully',
    });
};

/**
 * Delete a calendar event
 */
export const deleteEvent = async (request, reply) => {
    await calendarService.deleteEvent(request.params.id, request.user.id);

    return reply.send({
        success: true,
        message: 'Event deleted successfully',
    });
};
