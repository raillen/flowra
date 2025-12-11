import api from '../config/api';

/**
 * Card service for API communication
 * Handles all card-related API calls
 * 
 * @module services/cardService
 */

/**
 * Fetches all cards for a board
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @returns {Promise<Array>} Cards list
 */
export const getCards = async (projectId, boardId) => {
  const response = await api.get(`/projects/${projectId}/boards/${boardId}/cards`);
  const data = response.data.data || response.data;
  return Array.isArray(data) ? data : [];
};

/**
 * Fetches a single card by ID
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @returns {Promise<Object>} Card data
 */
export const getCardById = async (projectId, boardId, cardId) => {
  const response = await api.get(`/projects/${projectId}/boards/${boardId}/cards/${cardId}`);
  return response.data.data || response.data;
};

/**
 * Creates a new card
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} columnId - Column ID
 * @param {Object} cardData - Card data
 * @returns {Promise<Object>} Created card
 */
export const createCard = async (projectId, boardId, columnId, cardData) => {
  const response = await api.post(
    `/projects/${projectId}/boards/${boardId}/columns/${columnId}/cards`,
    cardData
  );
  return response.data.data || response.data;
};

/**
 * Updates an existing card
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated card
 */
export const updateCard = async (projectId, boardId, cardId, updateData) => {
  const response = await api.put(
    `/projects/${projectId}/boards/${boardId}/cards/${cardId}`,
    updateData
  );
  return response.data.data || response.data;
};

/**
 * Deletes a card
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @returns {Promise<void>}
 */
export const deleteCard = async (projectId, boardId, cardId) => {
  await api.delete(`/projects/${projectId}/boards/${boardId}/cards/${cardId}`);
};

/**
 * Moves a card to a different column
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} columnId - New column ID
 * @returns {Promise<Object>} Updated card
 */
export const moveCard = async (projectId, boardId, cardId, columnId) => {
  const response = await api.patch(
    `/projects/${projectId}/boards/${boardId}/cards/${cardId}/move`,
    { columnId }
  );
  return response.data.data || response.data;
};

