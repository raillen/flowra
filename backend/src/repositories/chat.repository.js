import { prisma } from '../config/database.js';

/**
 * Chat Repository
 * Database operations for chat conversations and messages
 * 
 * @module repositories/chat.repository
 */

/**
 * Find or create a conversation between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @param {Object} options - Optional context (projectId, boardId)
 * @returns {Promise<Object>} Conversation with participants
 */
export const findOrCreateConversation = async (userId1, userId2, options = {}) => {
    // Find existing conversation between these two users
    const existing = await prisma.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { userId: userId1 } } },
                { participants: { some: { userId: userId2 } } },
                { participants: { every: { userId: { in: [userId1, userId2] } } } },
            ],
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
        },
    });

    if (existing) {
        return existing;
    }

    // Create new conversation
    return prisma.conversation.create({
        data: {
            projectId: options.projectId || null,
            boardId: options.boardId || null,
            participants: {
                create: [
                    { userId: userId1 },
                    { userId: userId2 },
                ],
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
        },
    });
};

/**
 * Get all conversations for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of conversations with last message
 */
export const getConversationsForUser = async (userId) => {
    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: { userId },
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: {
                    sender: {
                        select: { id: true, name: true },
                    },
                },
            },
        },
        orderBy: { updatedAt: 'desc' },
    });

    // Calculate unread count for each conversation
    return Promise.all(
        conversations.map(async (conv) => {
            const participant = conv.participants.find(p => p.userId === userId);
            const unreadCount = await prisma.message.count({
                where: {
                    conversationId: conv.id,
                    senderId: { not: userId },
                    createdAt: participant?.lastReadAt
                        ? { gt: participant.lastReadAt }
                        : undefined,
                },
            });

            return {
                ...conv,
                unreadCount,
                lastMessage: conv.messages[0] || null,
            };
        })
    );
};

/**
 * Get conversation by ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object|null>} Conversation or null
 */
export const getConversationById = async (conversationId) => {
    return prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            participants: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
        },
    });
};

/**
 * Check if user is participant in conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user is participant
 */
export const isParticipant = async (conversationId, userId) => {
    const participant = await prisma.conversationParticipant.findUnique({
        where: {
            conversationId_userId: {
                conversationId,
                userId,
            },
        },
    });
    return !!participant;
};

/**
 * Get messages for a conversation with pagination
 * @param {string} conversationId - Conversation ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} Messages with reactions
 */
export const getMessages = async (conversationId, options = {}) => {
    const { limit = 50, before } = options;

    return prisma.message.findMany({
        where: {
            conversationId,
            ...(before && { createdAt: { lt: new Date(before) } }),
        },
        include: {
            sender: {
                select: { id: true, name: true, email: true },
            },
            reactions: {
                include: {
                    user: {
                        select: { id: true, name: true },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
};

/**
 * Create a new message
 * @param {Object} data - Message data
 * @returns {Promise<Object>} Created message
 */
export const createMessage = async (data) => {
    const message = await prisma.message.create({
        data: {
            content: data.content,
            conversationId: data.conversationId,
            senderId: data.senderId,
        },
        include: {
            sender: {
                select: { id: true, name: true, email: true },
            },
            reactions: true,
        },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
    });

    return message;
};

/**
 * Mark conversation as read for user
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 */
export const markAsRead = async (conversationId, userId) => {
    await prisma.conversationParticipant.update({
        where: {
            conversationId_userId: {
                conversationId,
                userId,
            },
        },
        data: {
            lastReadAt: new Date(),
        },
    });
};

/**
 * Add reaction to a message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @param {string} emoji - Emoji character
 * @returns {Promise<Object>} Created reaction
 */
export const addReaction = async (messageId, userId, emoji) => {
    return prisma.messageReaction.upsert({
        where: {
            messageId_userId_emoji: {
                messageId,
                userId,
                emoji,
            },
        },
        create: {
            messageId,
            userId,
            emoji,
        },
        update: {},
        include: {
            user: {
                select: { id: true, name: true },
            },
        },
    });
};

/**
 * Remove reaction from a message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @param {string} emoji - Emoji character
 */
export const removeReaction = async (messageId, userId, emoji) => {
    await prisma.messageReaction.deleteMany({
        where: {
            messageId,
            userId,
            emoji,
        },
    });
};

/**
 * Get message by ID
 * @param {string} messageId - Message ID
 * @returns {Promise<Object|null>} Message or null
 */
export const getMessageById = async (messageId) => {
    return prisma.message.findUnique({
        where: { id: messageId },
        include: {
            conversation: true,
            sender: {
                select: { id: true, name: true },
            },
            reactions: {
                include: {
                    user: {
                        select: { id: true, name: true },
                    },
                },
            },
        },
    });
};

/**
 * Get all users for starting new conversations
 * @param {string} currentUserId - Current user ID
 * @returns {Promise<Array>} List of users
 */
export const getAvailableUsers = async (currentUserId) => {
    return prisma.user.findMany({
        where: {
            id: { not: currentUserId },
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
        orderBy: { name: 'asc' },
    });
};

// ============================================
// PROJECT GROUP CHAT FUNCTIONS
// ============================================

/**
 * Create a project group chat
 * @param {string} projectId - Project ID
 * @param {string} projectName - Project name for chat title
 * @param {string} ownerId - Project owner ID
 * @returns {Promise<Object>} Created conversation
 */
export const createProjectChat = async (projectId, projectName, ownerId) => {
    return prisma.conversation.create({
        data: {
            name: `Chat: ${projectName}`,
            isGroup: true,
            projectId,
            participants: {
                create: [{ userId: ownerId }],
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
        },
    });
};

/**
 * Get project chat by project ID
 * @param {string} projectId - Project ID
 * @returns {Promise<Object|null>} Conversation or null
 */
export const getProjectChat = async (projectId) => {
    return prisma.conversation.findUnique({
        where: { projectId },
        include: {
            participants: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
            project: {
                select: { id: true, name: true },
            },
        },
    });
};

/**
 * Add participant to a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID to add
 */
export const addParticipantToConversation = async (conversationId, userId) => {
    // Check if already participant
    const existing = await prisma.conversationParticipant.findUnique({
        where: {
            conversationId_userId: { conversationId, userId },
        },
    });

    if (existing) return existing;

    return prisma.conversationParticipant.create({
        data: {
            conversationId,
            userId,
        },
    });
};

/**
 * Remove participant from a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID to remove
 */
export const removeParticipantFromConversation = async (conversationId, userId) => {
    await prisma.conversationParticipant.deleteMany({
        where: {
            conversationId,
            userId,
        },
    });
};

/**
 * Get projects for a user (owned or collaborating)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of projects
 */
export const getUserProjects = async (userId) => {
    return prisma.project.findMany({
        where: {
            userId, // For now, just projects owned by user
        },
        select: {
            id: true,
            name: true,
            conversation: {
                select: { id: true },
            },
        },
        orderBy: { name: 'asc' },
    });
};

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 */
export const deleteConversation = async (conversationId) => {
    return prisma.conversation.delete({
        where: { id: conversationId },
    });
};

