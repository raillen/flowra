import * as transferController from '../controllers/transfer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

/**
 * Transfer Routes
 * API endpoints for transfers
 * 
 * @module routes/transfer.routes
 */

export async function transferRoutes(fastify) {
    fastify.addHook('preHandler', authenticate);

    // GET /api/transfers/history - Get transfer history
    fastify.get('/transfers/history', {
        schema: {
            description: 'Get transfer history for user',
            tags: ['Transfers'],
        },
        handler: transferController.getTransferHistory,
    });

    // GET /api/transfers/targets - Get available targets
    fastify.get('/transfers/targets', {
        schema: {
            description: 'Get available transfer targets',
            tags: ['Transfers'],
            querystring: {
                type: 'object',
                required: ['entityType'],
                properties: {
                    entityType: { type: 'string', enum: ['project', 'board', 'card'] },
                },
            },
        },
        handler: transferController.getTransferTargets,
    });

    // PUT /api/transfers/projects/:id/ownership - Transfer project ownership
    fastify.put('/transfers/projects/:id/ownership', {
        schema: {
            description: 'Transfer project ownership to another user',
            tags: ['Transfers'],
            body: {
                type: 'object',
                required: ['newOwnerId'],
                properties: {
                    newOwnerId: { type: 'string' },
                },
            },
        },
        handler: transferController.transferProjectOwnership,
    });

    // PUT /api/transfers/boards/:id/move - Move board to another project
    fastify.put('/transfers/boards/:id/move', {
        schema: {
            description: 'Move board to another project',
            tags: ['Transfers'],
            body: {
                type: 'object',
                required: ['targetProjectId'],
                properties: {
                    targetProjectId: { type: 'string' },
                },
            },
        },
        handler: transferController.moveBoard,
    });

    // PUT /api/transfers/cards/:id/move - Move card to another board
    fastify.put('/transfers/cards/:id/move', {
        schema: {
            description: 'Move card to another board',
            tags: ['Transfers'],
            body: {
                type: 'object',
                required: ['targetBoardId'],
                properties: {
                    targetBoardId: { type: 'string' },
                    targetColumnId: { type: 'string' },
                },
            },
        },
        handler: transferController.moveCard,
    });

    // POST /api/transfers/cards/:id/clone - Clone card to another board
    fastify.post('/transfers/cards/:id/clone', {
        schema: {
            description: 'Clone card to another board',
            tags: ['Transfers'],
            body: {
                type: 'object',
                required: ['targetBoardId'],
                properties: {
                    targetBoardId: { type: 'string' },
                    targetColumnId: { type: 'string' },
                },
            },
        },
        handler: transferController.cloneCard,
    });
}
