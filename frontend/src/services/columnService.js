import api from '../config/api';

/**
 * Column service for API communication
 * Handles all column-related API calls
 * 
 * @module services/columnService
 */

/**
 * Fetches all columns for a board
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @returns {Promise<Array>} Columns list
 */
export const getColumns = async (projectId, boardId) => {
  const response = await api.get(`/projects/${projectId}/boards/${boardId}/columns`);
  const data = response.data.data || response.data;
  return Array.isArray(data) ? data : [];
};

/**
 * Fetches a single column by ID
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} columnId - Column ID
 * @returns {Promise<Object>} Column data
 */
export const getColumnById = async (projectId, boardId, columnId) => {
  const response = await api.get(`/projects/${projectId}/boards/${boardId}/columns/${columnId}`);
  return response.data.data || response.data;
};

/**
 * Creates a new column
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {Object} columnData - Column data
 * @returns {Promise<Object>} Created column
 */
export const createColumn = async (projectId, boardId, columnData) => {
  const response = await api.post(`/projects/${projectId}/boards/${boardId}/columns`, columnData);
  return response.data.data || response.data;
};

/**
 * Updates an existing column
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} columnId - Column ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated column
 */
export const updateColumn = async (projectId, boardId, columnId, updateData) => {
  const response = await api.put(
    `/projects/${projectId}/boards/${boardId}/columns/${columnId}`,
    updateData
  );
  return response.data.data || response.data;
};

/**
 * Deletes a column
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} columnId - Column ID
 * @returns {Promise<void>}
 */
export const deleteColumn = async (projectId, boardId, columnId) => {
  await api.delete(`/projects/${projectId}/boards/${boardId}/columns/${columnId}`);
};

/**
 * Updates column order
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {Array<{id: string, order: number}>} columns - Column order updates
 * @returns {Promise<void>}
 */
export const updateColumnOrder = async (projectId, boardId, columns) => {
  await api.patch(`/projects/${projectId}/boards/${boardId}/columns/order`, { columns });
};

