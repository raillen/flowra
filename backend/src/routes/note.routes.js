import * as noteController from '../controllers/note.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

/**
 * Note Routes
 * API endpoints for notes
 * 
 * @module routes/note.routes
 */

/**
 * Register note routes
 * @param {FastifyInstance} fastify - Fastify instance
 */
export async function noteRoutes(fastify) {
    // All routes require authentication
    fastify.addHook('preHandler', authenticate);

    // GET /api/notes - Get all notes
    fastify.get('/notes', {
        schema: {
            description: 'Get all notes for the authenticated user',
            tags: ['Notes'],
            querystring: {
                type: 'object',
                properties: {
                    search: { type: 'string' },
                    projectId: { type: 'string' },
                    limit: { type: 'integer', default: 50 },
                    offset: { type: 'integer', default: 0 },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array' },
                    },
                },
            },
        },
        handler: noteController.getNotes,
    });

    // GET /api/notes/:id - Get a single note
    fastify.get('/notes/:id', {
        schema: {
            description: 'Get a single note by ID',
            tags: ['Notes'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' },
                },
            },
        },
        handler: noteController.getNoteById,
    });

    // POST /api/notes - Create a new note
    fastify.post('/notes', {
        schema: {
            description: 'Create a new note',
            tags: ['Notes'],
            body: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    rawContent: { type: 'string' },
                    projectId: { type: 'string' },
                    references: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                type: { type: 'string' },
                                id: { type: 'string' },
                                title: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
        handler: noteController.createNote,
    });

    // PUT /api/notes/:id - Update a note
    fastify.put('/notes/:id', {
        schema: {
            description: 'Update a note',
            tags: ['Notes'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' },
                },
            },
        },
        handler: noteController.updateNote,
    });

    // DELETE /api/notes/:id - Delete a note
    fastify.delete('/notes/:id', {
        schema: {
            description: 'Delete a note',
            tags: ['Notes'],
        },
        handler: noteController.deleteNote,
    });

    // GET /api/notes/references/search - Search for entities to reference
    fastify.get('/notes/references/search', {
        schema: {
            description: 'Search for projects, boards, cards to reference',
            tags: ['Notes'],
            querystring: {
                type: 'object',
                properties: {
                    q: { type: 'string' },
                },
            },
        },
        handler: noteController.searchReferences,
    });


    // POST /api/notes/:id/share - Share a note
    fastify.post('/notes/:id/share', {
        schema: {
            description: 'Share a note with another user',
            tags: ['Notes'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' },
                },
            },
            body: {
                type: 'object',
                required: ['userId'],
                properties: {
                    userId: { type: 'string' },
                    permission: { type: 'string', enum: ['viewer', 'editor'], default: 'viewer' },
                },
            },
        },
        handler: noteController.shareNote,
    });

    // DELETE /api/notes/:id/share/:userId - Unshare a note
    fastify.delete('/notes/:id/share/:userId', {
        schema: {
            description: 'Remove a user from note shares',
            tags: ['Notes'],
            params: {
                type: 'object',
                required: ['id', 'userId'],
                properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                },
            },
        },
        handler: noteController.unshareNote,
    });
}
