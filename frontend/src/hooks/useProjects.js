import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/projectService';

/**
 * Custom hook for managing projects
 * Provides project data and CRUD operations
 * 
 * @module hooks/useProjects
 * @returns {Object} Projects state and operations
 */
export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches all projects
   */
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProjects();
      // Backend retorna { items, pagination } ou array direto
      const items = response.items || (Array.isArray(response) ? response : []);
      setProjects(items);
    } catch (err) {
      // Ignore abort errors (component unmounted or request cancelled)
      if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ECONNABORTED') {
        return;
      }
      setError(err.response?.data?.message || err.message || 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Created project
   */
  const addProject = async (projectData) => {
    try {
      setError(null);
      const newProject = await createProject(projectData);
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create project';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Updates an existing project
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated project
   */
  const updateProjectById = async (projectId, updateData) => {
    try {
      setError(null);
      const updatedProject = await updateProject(projectId, updateData);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? updatedProject : p))
      );
      return updatedProject;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update project';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Deletes a project
   * @param {string} projectId - Project ID
   */
  const removeProject = async (projectId) => {
    try {
      setError(null);
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete project';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject: updateProjectById,
    deleteProject: removeProject,
  };
};

