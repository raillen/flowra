import { useState, useCallback, useRef } from 'react';
import {
  getBoardsByProject,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
} from '../services/boardService';

/**
 * Custom hook for managing boards
 * Provides board data and CRUD operations
 * 
 * @module hooks/useBoards
 * @returns {Object} Boards state and operations
 */
export const useBoards = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(new Set());

  /**
   * Fetches all boards for a project
   * @param {string} projectId - Project ID
   * @param {AbortSignal} signal - Optional abort signal for request cancellation
   * @returns {Promise<Array>} Boards list
   */
  const fetchBoards = useCallback(async (projectId, signal = null) => {
    if (!projectId) return [];

    try {
      setLoading(true);
      setError(null);
      const boards = await getBoardsByProject(projectId, signal);
      return boards;
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        throw err; // Re-throw abort errors
      }
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch boards';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetches a single board
   * @param {string} projectId - Project ID
   * @param {string} boardId - Board ID
   * @param {AbortSignal} signal - Optional abort signal for request cancellation
   * @returns {Promise<Object>} Board data
   */
  const fetchBoard = useCallback(async (projectId, boardId, signal = null) => {
    if (!projectId || !boardId) {
      throw new Error('Project ID and Board ID are required');
    }

    const key = `board-${projectId}-${boardId}`;
    if (fetchingRef.current.has(key)) {
      // Already fetching, wait for existing request
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!fetchingRef.current.has(key)) {
            clearInterval(checkInterval);
            // Retry after current fetch completes
            setTimeout(() => {
              fetchBoard(projectId, boardId, signal).then(resolve).catch(reject);
            }, 100);
          }
        }, 50);
      });
    }

    try {
      fetchingRef.current.add(key);
      setLoading(true);
      setError(null);
      const board = await getBoardById(projectId, boardId, signal);
      // Ensure columns and cards are arrays
      return {
        ...board,
        columns: Array.isArray(board.columns) ? board.columns : [],
        cards: Array.isArray(board.cards) ? board.cards : [],
      };
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        throw err; // Re-throw abort errors
      }
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch board';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      fetchingRef.current.delete(key);
    }
  }, []);

  /**
   * Creates a new board
   * @param {string} projectId - Project ID
   * @param {Object} boardData - Board data
   * @returns {Promise<Object>} Created board
   */
  const addBoard = async (projectId, boardData) => {
    try {
      setError(null);
      const newBoard = await createBoard(projectId, boardData);
      return newBoard;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create board';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Updates an existing board
   * @param {string} projectId - Project ID
   * @param {string} boardId - Board ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated board
   */
  const updateBoardById = async (projectId, boardId, updateData) => {
    try {
      setError(null);
      const updatedBoard = await updateBoard(projectId, boardId, updateData);
      return updatedBoard;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update board';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Deletes a board
   * @param {string} projectId - Project ID
   * @param {string} boardId - Board ID
   */
  const removeBoard = async (projectId, boardId) => {
    try {
      setError(null);
      await deleteBoard(projectId, boardId);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete board';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    loading,
    error,
    fetchBoards,
    fetchBoard,
    addBoard,
    updateBoard: updateBoardById,
    deleteBoard: removeBoard,
    addMember: async (projectId, boardId, userId) => {
      try {
        return await import('../services/boardService').then(m => m.addMember(projectId, boardId, userId));
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    removeMember: async (projectId, boardId, userId) => {
      try {
        return await import('../services/boardService').then(m => m.removeMember(projectId, boardId, userId));
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
  };
};

