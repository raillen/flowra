import api from '../config/api';

/**
 * Comment service for API communication
 * Handles all comment-related API calls
 * 
 * @module services/commentService
 */

/**
 * Fetches all comments for a card
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @returns {Promise<Array>} Comments list
 */
export const getComments = async (projectId, boardId, cardId) => {
  const response = await api.get(`/projects/${projectId}/boards/${boardId}/cards/${cardId}/comments`);
  const data = response.data.data || response.data;
  return Array.isArray(data) ? data : [];
};

/**
 * Creates a new comment
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {Object} commentData - Comment data
 * @returns {Promise<Object>} Created comment
 */
export const createComment = async (projectId, boardId, cardId, commentData) => {
  const response = await api.post(
    `/projects/${projectId}/boards/${boardId}/cards/${cardId}/comments`,
    commentData
  );
  return response.data.data || response.data;
};

/**
 * Updates an existing comment
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} commentId - Comment ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated comment
 */
export const updateComment = async (projectId, boardId, cardId, commentId, updateData) => {
  const response = await api.put(
    `/projects/${projectId}/boards/${boardId}/cards/${cardId}/comments/${commentId}`,
    updateData
  );
  return response.data.data || response.data;
};

/**
 * Deletes a comment
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} commentId - Comment ID
 * @returns {Promise<void>}
 */
export const deleteComment = async (projectId, boardId, cardId, commentId) => {
  await api.delete(`/projects/${projectId}/boards/${boardId}/cards/${cardId}/comments/${commentId}`);
};

export const addReaction = async (projectId, boardId, cardId, commentId, emoji) => {
  const response = await api.post(
    `/projects/${projectId}/boards/${boardId}/cards/${cardId}/comments/${commentId}/reactions`,
    { emoji }
  );
  return response.data.data || response.data;
};

export const removeReaction = async (projectId, boardId, cardId, commentId, emoji) => {
  await api.delete(
    `/projects/${projectId}/boards/${boardId}/cards/${cardId}/comments/${commentId}/reactions`,
    { data: { emoji } }
  );
};

