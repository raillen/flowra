import api from '../config/api';

/**
 * Project service for API communication
 * Handles all project-related API calls
 * 
 * @module services/projectService
 */

/**
 * Fetches all projects for the authenticated user
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Projects list with pagination
 */
export const getProjects = async (params = {}) => {
  const response = await api.get('/projects', { params });
  // Backend retorna { success, data: { items, pagination } }
  return response.data.data || response.data;
};

/**
 * Fetches a single project by ID
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Project data
 */
export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data.data || response.data;
};

/**
 * Creates a new project
 * @param {Object} projectData - Project data
 * @param {string} projectData.name - Project name
 * @param {string} projectData.description - Project description
 * @param {string} projectData.companyId - Company ID
 * @param {string} projectData.groupId - Group ID
 * @returns {Promise<Object>} Created project
 */
export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data.data || response.data;
};

/**
 * Updates an existing project
 * @param {string} projectId - Project ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated project
 */
export const updateProject = async (projectId, updateData) => {
  const response = await api.put(`/projects/${projectId}`, updateData);
  return response.data.data || response.data;
};

/**
 * Deletes a project
 * @param {string} projectId - Project ID
 * @returns {Promise<void>}
 */
export const deleteProject = async (projectId) => {
  await api.delete(`/projects/${projectId}`);
};


/**
 * Adds a member to the project
 * @param {string} projectId 
 * @param {string} userId 
 * @returns {Promise<Object>} Added member
 */
export const addMember = async (projectId, userId) => {
  const response = await api.post(`/projects/${projectId}/members`, { userId });
  return response.data.data || response.data;
};

/**
 * Removes a member from the project
 * @param {string} projectId 
 * @param {string} userId 
 * @returns {Promise<void>}
 */
export const removeMember = async (projectId, userId) => {
  await api.delete(`/projects/${projectId}/members/${userId}`);
};
