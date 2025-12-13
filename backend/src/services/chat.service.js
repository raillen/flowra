import * as chatRepository from '../repositories/chat.repository.js';
import { emitToConversation, emitToUser, isUserOnline } from '../config/socket.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

/**
 * Chat Service
 * Business logic for chat operations
 * 
 * @module services/chat.service
 */

/**
 * Get or create a conversation with another user
 * @param {string} currentUserId - Current user ID
 * @param {string} otherUserId - Other user ID
 * @param {Object} options - Optional context
 * @returns {Promise<Object>} Conversation
 */
export const getOrCreateConversation = async (currentUserId, otherUserId, options = {}) => {
    const conversation = await chatRepository.findOrCreateConversation(
        currentUserId,
        otherUserId,
        options
    );

    // Get other user info and format response
    const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId);

    return {
        ...conversation,
        otherUser: otherParticipant?.user || null,
        online: isUserOnline(otherUserId),
    };
};

/**
 * Get all conversations for current user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Conversations with unread counts
 */
export const getConversations = async (userId) => {
    const conversations = await chatRepository.getConversationsForUser(userId);

    return conversations.map(conv => {
        const otherParticipant = conv.participants.find(p => p.userId !== userId);
        return {
            ...conv,
            otherUser: otherParticipant?.user || null,
            online: otherParticipant ? isUserOnline(otherParticipant.userId) : false,
        };
    });
};

/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - Current user ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} Messages
 */
export const getMessages = async (conversationId, userId, options = {}) => {
    // Verify user is participant
    const isParticipant = await chatRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
        throw new ForbiddenError('You are not a participant in this conversation');
    }

    const messages = await chatRepository.getMessages(conversationId, options);

    // Mark as read
    await chatRepository.markAsRead(conversationId, userId);

    // Return in chronological order (oldest first)
    return messages.reverse();
};

/**
 * Send a message
 * @param {string} conversationId - Conversation ID
 * @param {string} senderId - Sender user ID
 * @param {string} content - Message content
 * @returns {Promise<Object>} Created message
 */
export const sendMessage = async (conversationId, senderId, content) => {
    // Verify user is participant
    const isParticipant = await chatRepository.isParticipant(conversationId, senderId);
    if (!isParticipant) {
        throw new ForbiddenError('You are not a participant in this conversation');
    }

    // Create message
    const message = await chatRepository.createMessage({
        conversationId,
        senderId,
        content,
    });

    // Emit to conversation room
    emitToConversation(conversationId, 'chat:message', message);

    // Also notify other participants who may not be in the room
    const conversation = await chatRepository.getConversationById(conversationId);
    if (conversation) {
        conversation.participants
            .filter(p => p.userId !== senderId)
            .forEach(p => {
                emitToUser(p.userId, 'chat:newMessage', {
                    conversationId,
                    message,
                });
            });
    }

    return message;
};

/**
 * Add reaction to a message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @param {string} emoji - Emoji character
 * @returns {Promise<Object>} Reaction
 */
export const addReaction = async (messageId, userId, emoji) => {
    const message = await chatRepository.getMessageById(messageId);
    if (!message) {
        throw new NotFoundError('Message not found');
    }

    // Verify user is participant
    const isParticipant = await chatRepository.isParticipant(message.conversationId, userId);
    if (!isParticipant) {
        throw new ForbiddenError('You are not a participant in this conversation');
    }

    const reaction = await chatRepository.addReaction(messageId, userId, emoji);

    // Emit to conversation
    emitToConversation(message.conversationId, 'chat:reaction', {
        messageId,
        reaction,
        action: 'add',
    });

    return reaction;
};

/**
 * Remove reaction from a message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @param {string} emoji - Emoji character
 */
export const removeReaction = async (messageId, userId, emoji) => {
    const message = await chatRepository.getMessageById(messageId);
    if (!message) {
        throw new NotFoundError('Message not found');
    }

    // Verify user is participant
    const isParticipant = await chatRepository.isParticipant(message.conversationId, userId);
    if (!isParticipant) {
        throw new ForbiddenError('You are not a participant in this conversation');
    }

    await chatRepository.removeReaction(messageId, userId, emoji);

    // Emit to conversation
    emitToConversation(message.conversationId, 'chat:reaction', {
        messageId,
        emoji,
        userId,
        action: 'remove',
    });
};

/**
 * Get available users for starting new conversations
 * @param {string} currentUserId - Current user ID
 * @returns {Promise<Array>} Users
 */
export const getAvailableUsers = async (currentUserId) => {
    const users = await chatRepository.getAvailableUsers(currentUserId);

    return users.map(user => ({
        ...user,
        online: isUserOnline(user.id),
    }));
};

/**
 * Mark conversation as read
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 */
export const markAsRead = async (conversationId, userId) => {
    const isParticipant = await chatRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
        throw new ForbiddenError('You are not a participant in this conversation');
    }

    await chatRepository.markAsRead(conversationId, userId);
};

// ============================================
// PROJECT GROUP CHAT FUNCTIONS
// ============================================

/**
 * Get or create project group chat
 * @param {string} projectId - Project ID
 * @param {string} userId - Current user ID
 * @returns {Promise<Object>} Project chat
 */
export const getOrCreateProjectChat = async (projectId, userId) => {
    // Check if project chat exists
    let chat = await chatRepository.getProjectChat(projectId);

    if (!chat) {
        // Get project info
        const { prisma } = await import('../config/database.js');
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, name: true, userId: true },
        });

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        // Create project chat
        chat = await chatRepository.createProjectChat(projectId, project.name, project.userId);
    }

    // Verify user is participant
    const isParticipant = await chatRepository.isParticipant(chat.id, userId);
    if (!isParticipant) {
        throw new ForbiddenError('You are not a participant in this project chat');
    }

    return {
        ...chat,
        participantCount: chat.participants.length,
    };
};

/**
 * Add user to project chat
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID to add
 */
export const addUserToProjectChat = async (projectId, userId) => {
    const chat = await chatRepository.getProjectChat(projectId);
    if (!chat) return;

    await chatRepository.addParticipantToConversation(chat.id, userId);

    // Notify user they were added
    emitToUser(userId, 'chat:addedToGroup', {
        conversationId: chat.id,
        projectId,
    });
};

/**
 * Remove user from project chat
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID to remove
 */
export const removeUserFromProjectChat = async (projectId, userId) => {
    const chat = await chatRepository.getProjectChat(projectId);
    if (!chat) return;

    await chatRepository.removeParticipantFromConversation(chat.id, userId);

    // Notify user they were removed
    emitToUser(userId, 'chat:removedFromGroup', {
        conversationId: chat.id,
        projectId,
    });
};

/**
 * Get user's projects with chat info
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Projects with chat status
 */
export const getUserProjectsWithChat = async (userId) => {
    return chatRepository.getUserProjects(userId);
};

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID requesting deletion
 */
export const deleteConversation = async (conversationId, userId) => {
    // Check if participant
    const isParticipant = await chatRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
        throw new ForbiddenError('You are not a participant in this conversation');
    }

    // Optional: Check if user is owner/creator if strictly required. 
    // For now, allowing any participant to delete for simplicity or based on request "delete option".
    // Or maybe we treat it as "Leave" if not owner? 
    // User request was "delete chat", implying removal. 
    // I will implement HARD delete for now.

    await chatRepository.deleteConversation(conversationId);
};
