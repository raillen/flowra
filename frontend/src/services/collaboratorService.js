import api from '../config/api';

/**
 * Collaborator service for API communication
 * Handles all collaborator-related API calls
 * 
 * @module services/collaboratorService
 */

/**
 * Fetches all collaborators
 * @returns {Promise<Array>} Collaborators list
 */
export const getCollaborators = async (params = {}) => {
  const response = await api.get('/collaborators', { params });
  const data = response.data.data || response.data;
  return Array.isArray(data) ? data : (data.items || []);
};

/**
 * Fetches a single collaborator by ID
 * @param {string} collaboratorId - Collaborator ID
 * @returns {Promise<Object>} Collaborator data
 */
export const getCollaboratorById = async (collaboratorId) => {
  const response = await api.get(`/collaborators/${collaboratorId}`);
  return response.data.data || response.data;
};

/**
 * Creates a new collaborator
 * @param {Object} collaboratorData - Collaborator data
 * @returns {Promise<Object>} Created collaborator
 */
export const createCollaborator = async (collaboratorData) => {
  const response = await api.post('/collaborators', collaboratorData);
  return response.data.data || response.data;
};

/**
 * Updates an existing collaborator
 * @param {string} collaboratorId - Collaborator ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated collaborator
 */
export const updateCollaborator = async (collaboratorId, updateData) => {
  const response = await api.put(`/collaborators/${collaboratorId}`, updateData);
  return response.data.data || response.data;
};

/**
 * Deletes a collaborator
 * @param {string} collaboratorId - Collaborator ID
 * @returns {Promise<void>}
 */
export const deleteCollaborator = async (collaboratorId) => {
  await api.delete(`/collaborators/${collaboratorId}`);
};

/**
 * Imports collaborators from CSV
 * @param {File} file - CSV file
 * @returns {Promise<Object>} Import result
 */
export const importCollaboratorsFromCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/collaborators/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

