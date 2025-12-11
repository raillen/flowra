import * as calendarController from '../controllers/calendar.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

/**
 * Calendar Routes
 * API endpoints for calendar
 * 
 * @module routes/calendar.routes
 */

/**
 * Register calendar routes
 * @param {FastifyInstance} fastify - Fastify instance
 */
export async function calendarRoutes(fastify) {
    // All routes require authentication
    fastify.addHook('preHandler', authenticate);

    // GET /api/calendar - Get calendar items
    fastify.get('/calendar', {
        schema: {
            description: 'Get calendar items (cards, notes, events) for date range',
            tags: ['Calendar'],
            querystring: {
                type: 'object',
                required: ['startDate', 'endDate'],
                properties: {
                    startDate: { type: 'string' },
                    endDate: { type: 'string' },
                },
            },
        },
        handler: calendarController.getCalendarItems,
    });

    // POST /api/calendar/events - Create event
    fastify.post('/calendar/events', {
        schema: {
            description: 'Create a calendar event',
            tags: ['Calendar'],
            body: {
                type: 'object',
                required: ['title', 'startAt'],
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    startAt: { type: 'string' },
                    endAt: { type: 'string' },
                    allDay: { type: 'boolean' },
                    color: { type: 'string' },
                },
            },
        },
        handler: calendarController.createEvent,
    });

    // PUT /api/calendar/events/:id - Update event
    fastify.put('/calendar/events/:id', {
        schema: {
            description: 'Update a calendar event',
            tags: ['Calendar'],
        },
        handler: calendarController.updateEvent,
    });

    // DELETE /api/calendar/events/:id - Delete event
    fastify.delete('/calendar/events/:id', {
        schema: {
            description: 'Delete a calendar event',
            tags: ['Calendar'],
        },
        handler: calendarController.deleteEvent,
    });
}
