import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Tag repository layer
 * Handles all database operations for tags
 * 
 * @module repositories/tag
 */

/**
 * Creates a new tag
 * @param {Object} data - Tag data
 * @returns {Promise<Object>} Created tag
 */
export async function create(data) {
  try {
    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        color: data.color || '#3b82f6',
        boardId: data.boardId || null,
      },
    });
    
    return tag;
  } catch (error) {
    logger.error({ error, data }, 'Failed to create tag');
    throw error;
  }
}

/**
 * Finds a tag by ID
 * @param {string} id - Tag ID
 * @returns {Promise<Object|null>} Tag or null if not found
 */
export async function findById(id) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cards: true,
          },
        },
      },
    });
    
    return tag;
  } catch (error) {
    logger.error({ error, id }, 'Failed to find tag');
    throw error;
  }
}

/**
 * Finds all tags for a board
 * @param {string} boardId - Board ID
 * @returns {Promise<Array>} Array of tags
 */
export async function findByBoardId(boardId) {
  try {
    const tags = await prisma.tag.findMany({
      where: { boardId },
      include: {
        _count: {
          select: {
            cards: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    return tags;
  } catch (error) {
    logger.error({ error, boardId }, 'Failed to find tags by board');
    throw error;
  }
}

/**
 * Finds all tags for a card
 * @param {string} cardId - Card ID
 * @returns {Promise<Array>} Array of tags
 */
export async function findByCardId(cardId) {
  try {
    const cardTags = await prisma.cardTag.findMany({
      where: { cardId },
      include: {
        tag: true,
      },
    });
    
    return cardTags.map((ct) => ct.tag);
  } catch (error) {
    logger.error({ error, cardId }, 'Failed to find tags by card');
    throw error;
  }
}

/**
 * Updates a tag
 * @param {string} id - Tag ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated tag
 */
export async function update(id, data) {
  try {
    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.color !== undefined && { color: data.color }),
      },
    });
    
    return tag;
  } catch (error) {
    logger.error({ error, id, data }, 'Failed to update tag');
    throw error;
  }
}

/**
 * Deletes a tag
 * @param {string} id - Tag ID
 * @returns {Promise<void>}
 */
export async function deleteTag(id) {
  try {
    await prisma.tag.delete({
      where: { id },
    });
  } catch (error) {
    logger.error({ error, id }, 'Failed to delete tag');
    throw error;
  }
}

/**
 * Adds a tag to a card
 * @param {string} cardId - Card ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<void>}
 */
export async function addTagToCard(cardId, tagId) {
  try {
    await prisma.cardTag.create({
      data: {
        cardId,
        tagId,
      },
    });
  } catch (error) {
    logger.error({ error, cardId, tagId }, 'Failed to add tag to card');
    throw error;
  }
}

/**
 * Removes a tag from a card
 * @param {string} cardId - Card ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<void>}
 */
export async function removeTagFromCard(cardId, tagId) {
  try {
    await prisma.cardTag.delete({
      where: {
        cardId_tagId: {
          cardId,
          tagId,
        },
      },
    });
  } catch (error) {
    logger.error({ error, cardId, tagId }, 'Failed to remove tag from card');
    throw error;
  }
}

export const tagRepository = {
  create,
  findById,
  findByBoardId,
  findByCardId,
  update,
  delete: deleteTag,
  addTagToCard,
  removeTagFromCard,
};

