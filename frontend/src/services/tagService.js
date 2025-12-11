import api from '../config/api';

/**
 * Tag service for API communication
 * Handles all tag-related API calls
 * 
 * @module services/tagService
 */

/**
 * Fetches all tags for a board
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @returns {Promise<Array>} Tags list
 */
export const getTags = async (projectId, boardId) => {
  const response = await api.get(`/projects/${projectId}/boards/${boardId}/tags`);
  const data = response.data.data || response.data;
  return Array.isArray(data) ? data : [];
};

/**
 * Creates a new tag
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {Object} tagData - Tag data
 * @returns {Promise<Object>} Created tag
 */
export const createTag = async (projectId, boardId, tagData) => {
  const response = await api.post(`/projects/${projectId}/boards/${boardId}/tags`, tagData);
  return response.data.data || response.data;
};

/**
 * Updates an existing tag
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} tagId - Tag ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated tag
 */
export const updateTag = async (projectId, boardId, tagId, updateData) => {
  const response = await api.put(
    `/projects/${projectId}/boards/${boardId}/tags/${tagId}`,
    updateData
  );
  return response.data.data || response.data;
};

/**
 * Deletes a tag
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<void>}
 */
export const deleteTag = async (projectId, boardId, tagId) => {
  await api.delete(`/projects/${projectId}/boards/${boardId}/tags/${tagId}`);
};

/**
 * Adds a tag to a card
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<void>}
 */
export const addTagToCard = async (projectId, boardId, cardId, tagId) => {
  await api.post(`/projects/${projectId}/boards/${boardId}/cards/${cardId}/tags/${tagId}`);
};

/**
 * Removes a tag from a card
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<void>}
 */
export const removeTagFromCard = async (projectId, boardId, cardId, tagId) => {
  await api.delete(`/projects/${projectId}/boards/${boardId}/cards/${cardId}/tags/${tagId}`);
};

