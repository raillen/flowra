import api from '../config/api';

/**
 * Group service for API communication
 * Handles all group-related API calls
 * 
 * @module services/groupService
 */

/**
 * Fetches all groups
 * @returns {Promise<Array>} Groups list
 */
export const getGroups = async () => {
  const response = await api.get('/groups');
  const data = response.data.data || response.data;
  return Array.isArray(data) ? data : [];
};

/**
 * Fetches a single group by ID
 * @param {string} groupId - Group ID
 * @returns {Promise<Object>} Group data
 */
export const getGroupById = async (groupId) => {
  const response = await api.get(`/groups/${groupId}`);
  return response.data.data || response.data;
};

/**
 * Creates a new group
 * @param {Object} groupData - Group data
 * @param {string} groupData.name - Group name
 * @returns {Promise<Object>} Created group
 */
export const createGroup = async (groupData) => {
  const response = await api.post('/groups', groupData);
  return response.data.data || response.data;
};

/**
 * Updates an existing group
 * @param {string} groupId - Group ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated group
 */
export const updateGroup = async (groupId, updateData) => {
  const response = await api.put(`/groups/${groupId}`, updateData);
  return response.data.data || response.data;
};

/**
 * Deletes a group
 * @param {string} groupId - Group ID
 * @returns {Promise<void>}
 */
export const deleteGroup = async (groupId) => {
  await api.delete(`/groups/${groupId}`);
};

