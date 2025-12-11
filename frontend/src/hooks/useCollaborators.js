import { useState, useEffect } from 'react';
import {
  getCollaborators,
  createCollaborator,
  updateCollaborator,
  deleteCollaborator,
} from '../services/collaboratorService';

/**
 * Custom hook for managing collaborators
 * Provides collaborator data and CRUD operations
 * 
 * @module hooks/useCollaborators
 * @returns {Object} Collaborators state and operations
 */
export const useCollaborators = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches all collaborators
   */
  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCollaborators();
      setCollaborators(Array.isArray(data) ? data : []);
    } catch (err) {
      // Ignore abort errors (component unmounted or request cancelled)
      if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ECONNABORTED') {
        return;
      }
      setError(err.response?.data?.message || err.message || 'Failed to fetch collaborators');
      console.error('Error fetching collaborators:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new collaborator
   * @param {Object} collaboratorData - Collaborator data
   * @returns {Promise<Object>} Created collaborator
   */
  const addCollaborator = async (collaboratorData) => {
    try {
      setError(null);
      const newCollaborator = await createCollaborator(collaboratorData);
      setCollaborators((prev) => [...prev, newCollaborator]);
      return newCollaborator;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create collaborator';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Updates an existing collaborator
   * @param {string} collaboratorId - Collaborator ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated collaborator
   */
  const updateCollaboratorById = async (collaboratorId, updateData) => {
    try {
      setError(null);
      const updatedCollaborator = await updateCollaborator(collaboratorId, updateData);
      setCollaborators((prev) =>
        prev.map((c) => (c.id === collaboratorId ? updatedCollaborator : c))
      );
      return updatedCollaborator;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update collaborator';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Deletes a collaborator
   * @param {string} collaboratorId - Collaborator ID
   */
  const removeCollaborator = async (collaboratorId) => {
    try {
      setError(null);
      await deleteCollaborator(collaboratorId);
      setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete collaborator';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  return {
    collaborators,
    loading,
    error,
    fetchCollaborators,
    addCollaborator,
    updateCollaborator: updateCollaboratorById,
    deleteCollaborator: removeCollaborator,
  };
};

