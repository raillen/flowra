import * as chatController from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

/**
 * Chat Routes
 * API endpoints for real-time chat
 * 
 * @module routes/chat.routes
 */

/**
 * Register chat routes
 * @param {FastifyInstance} fastify - Fastify instance
 */
export async function chatRoutes(fastify) {
    // All routes require authentication
    fastify.addHook('preHandler', authenticate);

    // GET /api/chat/conversations - Get all conversations
    fastify.get('/chat/conversations', {
        schema: {
            description: 'Get all conversations for current user',
            tags: ['Chat'],
        },
        handler: chatController.getConversations,
    });

    // POST /api/chat/conversations - Create or get conversation with user
    fastify.post('/chat/conversations', {
        schema: {
            description: 'Get or create a conversation with another user',
            tags: ['Chat'],
            body: {
                type: 'object',
                required: ['userId'],
                properties: {
                    userId: { type: 'string' },
                    projectId: { type: 'string' },
                    boardId: { type: 'string' },
                },
            },
        },
        handler: chatController.getOrCreateConversation,
    });

    // GET /api/chat/users - Get available users for new conversations
    fastify.get('/chat/users', {
        schema: {
            description: 'Get available users to start conversations with',
            tags: ['Chat'],
        },
        handler: chatController.getAvailableUsers,
    });

    // GET /api/chat/conversations/:id/messages - Get messages
    fastify.get('/chat/conversations/:id/messages', {
        schema: {
            description: 'Get messages for a conversation',
            tags: ['Chat'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
            },
            querystring: {
                type: 'object',
                properties: {
                    limit: { type: 'integer', default: 50 },
                    before: { type: 'string' },
                },
            },
        },
        handler: chatController.getMessages,
    });

    // POST /api/chat/conversations/:id/messages - Send message
    fastify.post('/chat/conversations/:id/messages', {
        schema: {
            description: 'Send a message in a conversation',
            tags: ['Chat'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
            },
            body: {
                type: 'object',
                required: ['content'],
                properties: {
                    content: { type: 'string' },
                },
            },
        },
        handler: chatController.sendMessage,
    });

    // POST /api/chat/conversations/:id/read - Mark as read
    fastify.post('/chat/conversations/:id/read', {
        schema: {
            description: 'Mark conversation as read',
            tags: ['Chat'],
        },
        handler: chatController.markAsRead,
    });

    // POST /api/chat/messages/:id/reactions - Add reaction
    fastify.post('/chat/messages/:id/reactions', {
        schema: {
            description: 'Add reaction to a message',
            tags: ['Chat'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
            },
            body: {
                type: 'object',
                required: ['emoji'],
                properties: {
                    emoji: { type: 'string' },
                },
            },
        },
        handler: chatController.addReaction,
    });

    // DELETE /api/chat/messages/:id/reactions/:emoji - Remove reaction
    fastify.delete('/chat/messages/:id/reactions/:emoji', {
        schema: {
            description: 'Remove reaction from a message',
            tags: ['Chat'],
        },
        handler: chatController.removeReaction,
    });

    // ============================================
    // PROJECT GROUP CHAT ROUTES
    // ============================================

    // GET /api/chat/projects - Get user's projects with chat status
    fastify.get('/chat/projects', {
        schema: {
            description: 'Get user projects with chat status',
            tags: ['Chat', 'Project'],
        },
        handler: chatController.getUserProjects,
    });

    // GET /api/chat/projects/:projectId/chat - Get or create project chat
    fastify.get('/chat/projects/:projectId/chat', {
        schema: {
            description: 'Get or create project group chat',
            tags: ['Chat', 'Project'],
            params: {
                type: 'object',
                properties: {
                    projectId: { type: 'string' },
                },
            },
        },
        handler: chatController.getProjectChat,
    });
}
