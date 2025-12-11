import * as chatService from '../services/chat.service.js';

/**
 * Chat Controller
 * HTTP handlers for chat endpoints
 * 
 * @module controllers/chat.controller
 */

/**
 * Get all conversations for current user
 */
export const getConversations = async (request, reply) => {
    const conversations = await chatService.getConversations(request.user.id);

    return reply.send({
        success: true,
        data: conversations,
    });
};

/**
 * Get or create conversation with a user
 */
export const getOrCreateConversation = async (request, reply) => {
    const { userId, projectId, boardId } = request.body;

    const conversation = await chatService.getOrCreateConversation(
        request.user.id,
        userId,
        { projectId, boardId }
    );

    return reply.send({
        success: true,
        data: conversation,
    });
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (request, reply) => {
    const { id } = request.params;
    const { limit, before } = request.query;

    const messages = await chatService.getMessages(id, request.user.id, {
        limit: limit ? parseInt(limit) : 50,
        before,
    });

    return reply.send({
        success: true,
        data: messages,
    });
};

/**
 * Send a message
 */
export const sendMessage = async (request, reply) => {
    const { id } = request.params;
    const { content } = request.body;

    const message = await chatService.sendMessage(id, request.user.id, content);

    return reply.status(201).send({
        success: true,
        data: message,
    });
};

/**
 * Add reaction to a message
 */
export const addReaction = async (request, reply) => {
    const { id } = request.params;
    const { emoji } = request.body;

    const reaction = await chatService.addReaction(id, request.user.id, emoji);

    return reply.send({
        success: true,
        data: reaction,
    });
};

/**
 * Remove reaction from a message
 */
export const removeReaction = async (request, reply) => {
    const { id, emoji } = request.params;

    await chatService.removeReaction(id, request.user.id, emoji);

    return reply.send({
        success: true,
        message: 'Reaction removed',
    });
};

/**
 * Get available users for new conversations
 */
export const getAvailableUsers = async (request, reply) => {
    const users = await chatService.getAvailableUsers(request.user.id);

    return reply.send({
        success: true,
        data: users,
    });
};

/**
 * Mark conversation as read
 */
export const markAsRead = async (request, reply) => {
    const { id } = request.params;

    await chatService.markAsRead(id, request.user.id);

    return reply.send({
        success: true,
        message: 'Marked as read',
    });
};

/**
 * Get project chat
 */
export const getProjectChat = async (request, reply) => {
    const { projectId } = request.params;

    const chat = await chatService.getOrCreateProjectChat(projectId, request.user.id);

    return reply.send({
        success: true,
        data: chat,
    });
};

/**
 * Get user's projects with chat status
 */
export const getUserProjects = async (request, reply) => {
    const projects = await chatService.getUserProjectsWithChat(request.user.id);

    return reply.send({
        success: true,
        data: projects,
    });
};
