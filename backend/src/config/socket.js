import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './environment.js';
import { logger } from './logger.js';

/**
 * Socket.io Configuration
 * Manages WebSocket connections for real-time chat
 * 
 * @module config/socket
 */

let io = null;

// Track online users: { oderId: Set<socketId> }
const onlineUsers = new Map();

/**
 * Initialize Socket.io with Fastify
 * @param {FastifyInstance} app - Fastify app instance
 */
export const initializeSocket = (app) => {
    io = new Server(app.server, {
        cors: {
            origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map(o => o.trim()),
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            logger.warn('Socket connection rejected: No token provided');
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            socket.userId = decoded.id;
            socket.user = decoded;
            next();
        } catch (error) {
            logger.warn({ error: error.message }, 'Socket connection rejected: Invalid token');
            return next(new Error('Invalid token'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        const userId = socket.userId;
        logger.info({ userId, socketId: socket.id }, 'User connected to socket');

        // Track online status
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        // Notify others that user is online
        socket.broadcast.emit('chat:online', { userId, online: true });

        // Join user's personal room for direct messages
        socket.join(`user:${userId}`);

        // Handle joining a conversation room
        socket.on('chat:join', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
            logger.debug({ userId, conversationId }, 'User joined conversation room');
        });

        // Handle leaving a conversation room
        socket.on('chat:leave', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
            logger.debug({ userId, conversationId }, 'User left conversation room');
        });

        // Handle typing indicator
        socket.on('chat:typing', ({ conversationId, isTyping }) => {
            socket.to(`conversation:${conversationId}`).emit('chat:typing', {
                conversationId,
                userId,
                isTyping,
            });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            logger.info({ userId, socketId: socket.id }, 'User disconnected from socket');

            const userSockets = onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                    // Notify others that user is offline
                    socket.broadcast.emit('chat:online', { userId, online: false });
                }
            }
        });
    });

    logger.info('Socket.io initialized');
    return io;
};

/**
 * Get Socket.io instance
 * @returns {Server} Socket.io server instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

/**
 * Emit event to a specific conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToConversation = (conversationId, event, data) => {
    if (io) {
        io.to(`conversation:${conversationId}`).emit(event, data);
    }
};

/**
 * Emit event to a specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

/**
 * Check if a user is online
 * @param {string} userId - User ID
 * @returns {boolean} True if user is online
 */
export const isUserOnline = (userId) => {
    return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
};

/**
 * Get all online user IDs
 * @returns {string[]} Array of online user IDs
 */
export const getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
};
