import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Comment repository layer
 * Handles all database operations for comments
 * 
 * @module repositories/comment
 */

/**
 * Creates a new comment
 * @param {Object} data - Comment data
 * @returns {Promise<Object>} Created comment
 */
export async function create(data) {
  try {
    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        cardId: data.cardId,
        userId: data.userId,
        parentId: data.parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return comment;
  } catch (error) {
    logger.error({ error, data }, 'Failed to create comment');
    throw error;
  }
}

/**
 * Finds all comments for a card
 * @param {string} cardId - Card ID
 * @returns {Promise<Array>} Array of comments
 */
export async function findByCardId(cardId) {
  try {
    const comments = await prisma.comment.findMany({
      where: { cardId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        replies: {
          include: {
            user: { select: { id: true, name: true } },
            reactions: { include: { user: { select: { id: true, name: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments;
  } catch (error) {
    logger.error({ error, cardId }, 'Failed to find comments by card');
    throw error;
  }
}

/**
 * Finds a comment by ID
 * @param {string} id - Comment ID
 * @returns {Promise<Object|null>} Comment or null if not found
 */
export async function findById(id) {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return comment;
  } catch (error) {
    logger.error({ error, id }, 'Failed to find comment');
    throw error;
  }
}

/**
 * Updates a comment
 * @param {string} id - Comment ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated comment
 */
export async function update(id, data) {
  try {
    const comment = await prisma.comment.update({
      where: { id },
      data: {
        content: data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return comment;
  } catch (error) {
    logger.error({ error, id, data }, 'Failed to update comment');
    throw error;
  }
}

/**
 * Deletes a comment
 * @param {string} id - Comment ID
 * @returns {Promise<void>}
 */
export async function deleteComment(id) {
  try {
    await prisma.comment.delete({
      where: { id },
    });
  } catch (error) {
    logger.error({ error, id }, 'Failed to delete comment');
    throw error;
  }
}


export async function addReaction(commentId, userId, emoji) {
  try {
    return await prisma.commentReaction.create({
      data: { commentId, userId, emoji },
      include: { user: { select: { id: true, name: true } } }
    });
  } catch (error) {
    if (error.code === 'P2002') return null; // Already exists
    throw error;
  }
}

export async function removeReaction(commentId, userId, emoji) {
  try {
    await prisma.commentReaction.deleteMany({
      where: { commentId, userId, emoji }
    });
  } catch (error) {
    throw error;
  }
}

export const commentRepository = {
  create,
  findById,
  findByCardId,
  update,
  delete: deleteComment,
  addReaction,
  removeReaction,
};

