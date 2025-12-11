import api from '../config/api';

/**
 * Board service for API communication
 * Handles all board-related API calls
 * 
 * @module services/boardService
 */

/**
 * Fetches all boards for a project
 * @param {string} projectId - Project ID
 * @param {AbortSignal} signal - Optional abort signal for request cancellation
 * @returns {Promise<Array>} Boards list
 */
export const getBoardsByProject = async (projectId, signal = null) => {
  try {
    const config = signal ? { signal } : {};
    const response = await api.get(`/projects/${projectId}/boards`, config);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'CanceledError') {
      throw error; // Re-throw abort errors
    }
    console.error('Error fetching boards:', {
      projectId,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

/**
 * Fetches a single board by ID
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {AbortSignal} signal - Optional abort signal for request cancellation
 * @returns {Promise<Object>} Board data
 */
export const getBoardById = async (projectId, boardId, signal = null) => {
  try {
    const config = signal ? { signal } : {};
    const response = await api.get(`/projects/${projectId}/boards/${boardId}`, config);
    return response.data.data || response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'CanceledError') {
      throw error; // Re-throw abort errors
    }
    console.error('Error fetching board:', {
      projectId,
      boardId,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

/**
 * Creates a new board
 * @param {string} projectId - Project ID
 * @param {Object} boardData - Board data
 * @param {string} boardData.name - Board name
 * @returns {Promise<Object>} Created board
 */
export const createBoard = async (projectId, boardData) => {
  const response = await api.post(`/projects/${projectId}/boards`, boardData);
  return response.data.data || response.data;
};

/**
 * Updates an existing board
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated board
 */
export const updateBoard = async (projectId, boardId, updateData) => {
  const response = await api.put(
    `/projects/${projectId}/boards/${boardId}`,
    updateData
  );
  return response.data.data || response.data;
};

/**
 * Deletes a board
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @returns {Promise<void>}
 */
export const deleteBoard = async (projectId, boardId) => {
  await api.delete(`/projects/${projectId}/boards/${boardId}`);
};


/**
 * Adds a member to the board
 * @param {string} projectId 
 * @param {string} boardId 
 * @param {string} userId 
 * @returns {Promise<Object>} Added member
 */
export const addMember = async (projectId, boardId, userId) => {
  const response = await api.post(`/projects/${projectId}/boards/${boardId}/members`, { userId });
  return response.data.data || response.data;
};

/**
 * Removes a member from the board
 * @param {string} projectId 
 * @param {string} boardId 
 * @param {string} userId 
 * @returns {Promise<void>}
 */
export const removeMember = async (projectId, boardId, userId) => {
  await api.delete(`/projects/${projectId}/boards/${boardId}/members/${userId}`);
};
