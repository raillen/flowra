import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Attachment repository layer
 * Handles all database operations for attachments
 * 
 * @module repositories/attachment
 */

/**
 * Creates a new attachment
 * @param {Object} data - Attachment data
 * @returns {Promise<Object>} Created attachment
 */
export async function create(data) {
  try {
    const attachment = await prisma.attachment.create({
      data: {
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        url: data.url,
        cardId: data.cardId,
        uploadedBy: data.uploadedBy,
      },
    });
    
    return attachment;
  } catch (error) {
    logger.error({ error, data }, 'Failed to create attachment');
    throw error;
  }
}

/**
 * Finds all attachments for a card
 * @param {string} cardId - Card ID
 * @returns {Promise<Array>} Array of attachments
 */
export async function findByCardId(cardId) {
  try {
    const attachments = await prisma.attachment.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
    });
    
    return attachments;
  } catch (error) {
    logger.error({ error, cardId }, 'Failed to find attachments by card');
    throw error;
  }
}

/**
 * Finds an attachment by ID
 * @param {string} id - Attachment ID
 * @returns {Promise<Object|null>} Attachment or null if not found
 */
export async function findById(id) {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });
    
    return attachment;
  } catch (error) {
    logger.error({ error, id }, 'Failed to find attachment');
    throw error;
  }
}

/**
 * Deletes an attachment
 * @param {string} id - Attachment ID
 * @returns {Promise<void>}
 */
export async function deleteAttachment(id) {
  try {
    await prisma.attachment.delete({
      where: { id },
    });
  } catch (error) {
    logger.error({ error, id }, 'Failed to delete attachment');
    throw error;
  }
}

export const attachmentRepository = {
  create,
  findById,
  findByCardId,
  delete: deleteAttachment,
};

