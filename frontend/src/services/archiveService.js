import api from '../config/api';

/**
 * Archive service for managing archived cards
 * @module services/archiveService
 */

/**
 * Get all archived cards grouped by project/board
 * @returns {Promise<Object>} Archived cards grouped by project
 */
export const getArchivedCards = async () => {
    const response = await api.get('/archive/cards');
    return response.data;
};

/**
 * Archive a card
 * @param {string} cardId - Card ID to archive
 * @returns {Promise<Object>} Archived card
 */
export const archiveCard = async (cardId) => {
    const response = await api.post(`/archive/cards/${cardId}/archive`);
    return response.data;
};

/**
 * Restore an archived card
 * @param {string} cardId - Card ID to restore
 * @param {string} targetColumnId - Column ID to restore the card to
 * @returns {Promise<Object>} Restored card
 */
export const restoreCard = async (cardId, targetColumnId = null) => {
    const response = await api.post(`/archive/cards/${cardId}/restore`, {
        targetColumnId
    });
    return response.data;
};

/**
 * Permanently delete an archived card
 * @param {string} cardId - Card ID to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteArchivedCard = async (cardId) => {
    const response = await api.delete(`/archive/cards/${cardId}`);
    return response.data;
};

/**
 * Bulk delete archived cards
 * @param {string[]} cardIds - Array of card IDs to delete
 * @returns {Promise<Object>} Deletion result
 */
export const bulkDeleteArchivedCards = async (cardIds) => {
    const response = await api.delete('/archive/cards/bulk', { data: { cardIds } });
    return response.data;
};
