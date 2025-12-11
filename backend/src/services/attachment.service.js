import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { attachmentRepository } from '../repositories/attachment.repository.js';
import { cardRepository } from '../repositories/card.repository.js';
import { logger } from '../config/logger.js';

/**
 * Attachment service layer
 * Contains business logic for attachment operations
 * 
 * @module services/attachment
 */

/**
 * Creates a new attachment
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {Object} attachmentData - Attachment data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created attachment
 */
export async function createAttachment(boardId, cardId, attachmentData, userId) {
  logger.debug({ boardId, cardId, userId }, 'Creating attachment');
  
  // Verify card exists and belongs to board
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }
  
  const attachment = await attachmentRepository.create({
    ...attachmentData,
    cardId,
    uploadedBy: userId,
  });
  
  logger.info({ attachmentId: attachment.id, cardId }, 'Attachment created successfully');
  return attachment;
}

/**
 * Lists all attachments for a card
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @returns {Promise<Array>} Array of attachments
 */
export async function listAttachments(boardId, cardId) {
  // Verify card exists and belongs to board
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }
  
  const attachments = await attachmentRepository.findByCardId(cardId);
  return attachments;
}

/**
 * Deletes an attachment
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} attachmentId - Attachment ID
 * @param {string} userId - User ID (must be uploader or admin)
 * @returns {Promise<void>}
 */
export async function deleteAttachment(boardId, cardId, attachmentId, userId) {
  // Verify card exists
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }
  
  // Verify attachment exists
  const attachment = await attachmentRepository.findById(attachmentId);
  if (!attachment || attachment.cardId !== cardId) {
    throw new NotFoundError('Attachment not found');
  }
  
  // Only uploader can delete (or admin - can be enhanced later)
  if (attachment.uploadedBy !== userId) {
    throw new ForbiddenError('You can only delete your own attachments');
  }
  
  await attachmentRepository.delete(attachmentId);
  
  logger.info({ attachmentId, cardId }, 'Attachment deleted successfully');
}

