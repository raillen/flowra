import { NotFoundError, ConflictError } from '../utils/errors.js';
import { tagRepository } from '../repositories/tag.repository.js';
import { boardRepository } from '../repositories/board.repository.js';
import { cardRepository } from '../repositories/card.repository.js';
import { logger } from '../config/logger.js';

/**
 * Tag service layer
 * Contains business logic for tag operations
 * 
 * @module services/tag
 */

/**
 * Creates a new tag
 * @param {string} boardId - Board ID
 * @param {Object} tagData - Tag data
 * @returns {Promise<Object>} Created tag
 */
export async function createTag(boardId, tagData) {
  logger.debug({ boardId, tagData }, 'Creating tag');
  
  // Verify board exists
  const board = await boardRepository.findById(boardId);
  if (!board) {
    throw new NotFoundError('Board not found');
  }
  
  // Check for duplicate name in board
  const existingTags = await tagRepository.findByBoardId(boardId);
  const duplicate = existingTags.find((t) => t.name.toLowerCase() === tagData.name.toLowerCase());
  if (duplicate) {
    throw new ConflictError('Tag with this name already exists in this board');
  }
  
  const tag = await tagRepository.create({
    ...tagData,
    boardId,
  });
  
  logger.info({ tagId: tag.id, boardId }, 'Tag created successfully');
  return tag;
}

/**
 * Lists all tags for a board
 * @param {string} boardId - Board ID
 * @returns {Promise<Array>} Array of tags
 */
export async function listTags(boardId) {
  // Verify board exists
  const board = await boardRepository.findById(boardId);
  if (!board) {
    throw new NotFoundError('Board not found');
  }
  
  const tags = await tagRepository.findByBoardId(boardId);
  return tags;
}

/**
 * Updates a tag
 * @param {string} boardId - Board ID
 * @param {string} tagId - Tag ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated tag
 */
export async function updateTag(boardId, tagId, updateData) {
  // Verify tag exists and belongs to board
  const tag = await tagRepository.findById(tagId);
  if (!tag || tag.boardId !== boardId) {
    throw new NotFoundError('Tag not found');
  }
  
  // Check for duplicate name if name is being updated
  if (updateData.name) {
    const existingTags = await tagRepository.findByBoardId(boardId);
    const duplicate = existingTags.find(
      (t) => t.id !== tagId && t.name.toLowerCase() === updateData.name.toLowerCase()
    );
    if (duplicate) {
      throw new ConflictError('Tag with this name already exists in this board');
    }
  }
  
  const updated = await tagRepository.update(tagId, updateData);
  
  logger.info({ tagId, boardId }, 'Tag updated successfully');
  return updated;
}

/**
 * Deletes a tag
 * @param {string} boardId - Board ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<void>}
 */
export async function deleteTag(boardId, tagId) {
  // Verify tag exists and belongs to board
  const tag = await tagRepository.findById(tagId);
  if (!tag || tag.boardId !== boardId) {
    throw new NotFoundError('Tag not found');
  }
  
  await tagRepository.delete(tagId);
  
  logger.info({ tagId, boardId }, 'Tag deleted successfully');
}

/**
 * Adds a tag to a card
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<void>}
 */
export async function addTagToCard(boardId, cardId, tagId) {
  // Verify card exists
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }
  
  // Verify tag exists and belongs to board
  const tag = await tagRepository.findById(tagId);
  if (!tag || tag.boardId !== boardId) {
    throw new NotFoundError('Tag not found');
  }
  
  await tagRepository.addTagToCard(cardId, tagId);
  
  logger.info({ cardId, tagId, boardId }, 'Tag added to card');
}

/**
 * Removes a tag from a card
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<void>}
 */
export async function removeTagFromCard(boardId, cardId, tagId) {
  // Verify card exists
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }
  
  // Verify tag exists
  const tag = await tagRepository.findById(tagId);
  if (!tag || tag.boardId !== boardId) {
    throw new NotFoundError('Tag not found');
  }
  
  await tagRepository.removeTagFromCard(cardId, tagId);
  
  logger.info({ cardId, tagId, boardId }, 'Tag removed from card');
}

