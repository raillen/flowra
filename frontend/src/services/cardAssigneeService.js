/**
 * Card Assignee Service
 * Handles API calls for card assignee management
 * 
 * @module services/cardAssigneeService
 */

import api from '../config/api';

/**
 * Get assignees for a card
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @returns {Promise<Array>} List of assignees
 */
export const getAssignees = async (projectId, boardId, cardId) => {
    const response = await api.get(
        `/projects/${projectId}/boards/${boardId}/cards/${cardId}`
    );
    const card = response.data.data || response.data;
    return card.assignees || [];
};

/**
 * Update card assignees (replace all)
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {Array<string>} assigneeIds - Array of user IDs
 * @returns {Promise<Object>} Updated card
 */
export const updateAssignees = async (projectId, boardId, cardId, assigneeIds) => {
    const response = await api.put(
        `/projects/${projectId}/boards/${boardId}/cards/${cardId}/assignees`,
        { assigneeIds }
    );
    return response.data.data || response.data;
};

/**
 * Add a single assignee to a card
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} userId - User ID to add
 * @param {Array} currentAssignees - Current assignee list
 * @returns {Promise<Object>} Updated card
 */
export const addAssignee = async (projectId, boardId, cardId, userId, currentAssignees = []) => {
    const currentIds = currentAssignees.map(a => a.userId || a.user?.id || a.id);
    if (!currentIds.includes(userId)) {
        currentIds.push(userId);
    }
    return updateAssignees(projectId, boardId, cardId, currentIds);
};

/**
 * Remove a single assignee from a card
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} userId - User ID to remove
 * @param {Array} currentAssignees - Current assignee list
 * @returns {Promise<Object>} Updated card
 */
export const removeAssignee = async (projectId, boardId, cardId, userId, currentAssignees = []) => {
    const currentIds = currentAssignees
        .map(a => a.userId || a.user?.id || a.id)
        .filter(id => id !== userId);
    return updateAssignees(projectId, boardId, cardId, currentIds);
};
