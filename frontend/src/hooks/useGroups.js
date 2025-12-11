import { useState, useEffect } from 'react';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../services/groupService';

/**
 * Custom hook for managing groups
 * Provides group data and CRUD operations
 * 
 * @module hooks/useGroups
 * @returns {Object} Groups state and operations
 */
export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches all groups
   */
  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGroups();
      setGroups(data);
    } catch (err) {
      // Ignore abort errors (component unmounted or request cancelled)
      if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ECONNABORTED') {
        return;
      }
      setError(err.message || 'Failed to fetch groups');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new group
   * @param {Object} groupData - Group data
   * @returns {Promise<Object>} Created group
   */
  const addGroup = async (groupData) => {
    try {
      setError(null);
      const newGroup = await createGroup(groupData);
      setGroups((prev) => [...prev, newGroup]);
      return newGroup;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.name ||
                          err.message || 
                          'Failed to create group';
      setError(errorMessage);
      console.error('Error creating group:', err);
      throw err;
    }
  };

  /**
   * Updates an existing group
   * @param {string} groupId - Group ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated group
   */
  const updateGroupById = async (groupId, updateData) => {
    try {
      const updatedGroup = await updateGroup(groupId, updateData);
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? updatedGroup : g))
      );
      return updatedGroup;
    } catch (err) {
      setError(err.message || 'Failed to update group');
      throw err;
    }
  };

  /**
   * Deletes a group
   * @param {string} groupId - Group ID
   */
  const removeGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch (err) {
      setError(err.message || 'Failed to delete group');
      throw err;
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    loading,
    error,
    fetchGroups,
    addGroup,
    updateGroup: updateGroupById,
    deleteGroup: removeGroup,
  };
};

