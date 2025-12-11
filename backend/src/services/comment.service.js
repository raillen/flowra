import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { commentRepository } from '../repositories/comment.repository.js';
import { cardRepository } from '../repositories/card.repository.js';
import { logger } from '../config/logger.js';

/**
 * Comment service layer
 * Contains business logic for comment operations
 * 
 * @module services/comment
 */

/**
 * Creates a new comment
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {Object} commentData - Comment data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created comment
 */
export async function createComment(boardId, cardId, commentData, userId) {
  logger.debug({ boardId, cardId, userId }, 'Creating comment');

  // Verify card exists and belongs to board
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }

  const comment = await commentRepository.create({
    content: commentData.content,
    cardId,
    userId,
  });

  logger.info({ commentId: comment.id, cardId }, 'Comment created successfully');
  return comment;
}

/**
 * Lists all comments for a card
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @returns {Promise<Array>} Array of comments
 */
export async function listComments(boardId, cardId) {
  // Verify card exists and belongs to board
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }

  const comments = await commentRepository.findByCardId(cardId);
  return comments;
}

/**
 * Updates a comment
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} commentId - Comment ID
 * @param {Object} updateData - Update data
 * @param {string} userId - User ID (must be comment owner)
 * @returns {Promise<Object>} Updated comment
 */
export async function updateComment(boardId, cardId, commentId, updateData, userId) {
  // Verify card exists
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }

  // Verify comment exists and belongs to user
  const comment = await commentRepository.findById(commentId);
  if (!comment || comment.cardId !== cardId) {
    throw new NotFoundError('Comment not found');
  }

  if (comment.userId !== userId) {
    throw new ForbiddenError('You can only edit your own comments');
  }

  const updated = await commentRepository.update(commentId, updateData);

  logger.info({ commentId, cardId }, 'Comment updated successfully');
  return updated;
}

/**
 * Deletes a comment
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} commentId - Comment ID
 * @param {string} userId - User ID (must be comment owner or admin)
 * @returns {Promise<void>}
 */
export async function deleteComment(boardId, cardId, commentId, userId) {
  // Verify card exists
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }

  // Verify comment exists
  const comment = await commentRepository.findById(commentId);
  if (!comment || comment.cardId !== cardId) {
    throw new NotFoundError('Comment not found');
  }

  // Only comment owner can delete (or admin - can be enhanced later)
  if (comment.userId !== userId) {
    throw new ForbiddenError('You can only delete your own comments');
  }

  await commentRepository.delete(commentId);

  logger.info({ commentId, cardId }, 'Comment deleted successfully');
}

export async function addReaction(boardId, cardId, commentId, userId, emoji) {
  // Verification logic (card/comment exists) similar to other methods
  return await commentRepository.addReaction(commentId, userId, emoji);
}

export async function removeReaction(boardId, cardId, commentId, userId, emoji) {
  return await commentRepository.removeReaction(commentId, userId, emoji);
}

