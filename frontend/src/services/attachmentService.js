import api from '../config/api';

/**
 * Attachment service for API communication
 * Handles all attachment-related API calls
 * 
 * @module services/attachmentService
 */

/**
 * Fetches all attachments for a card
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @returns {Promise<Array>} Attachments list
 */
export const getAttachments = async (projectId, boardId, cardId) => {
  const response = await api.get(`/projects/${projectId}/boards/${boardId}/cards/${cardId}/attachments`);
  const data = response.data.data || response.data;
  return Array.isArray(data) ? data : [];
};

/**
 * Creates a new attachment
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {Object} attachmentData - Attachment data
 * @returns {Promise<Object>} Created attachment
 */
export const createAttachment = async (projectId, boardId, cardId, attachmentData) => {
  const response = await api.post(
    `/projects/${projectId}/boards/${boardId}/cards/${cardId}/attachments`,
    attachmentData
  );
  return response.data.data || response.data;
};

/**
 * Deletes an attachment
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} attachmentId - Attachment ID
 * @returns {Promise<void>}
 */
export const deleteAttachment = async (projectId, boardId, cardId, attachmentId) => {
  await api.delete(`/projects/${projectId}/boards/${boardId}/cards/${cardId}/attachments/${attachmentId}`);
};

