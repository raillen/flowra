import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Navigation context for managing application navigation state
 * Tracks active module, project, and board
 * Persists state to localStorage for refresh persistence
 * 
 * @module contexts/NavigationContext
 */

const NavigationContext = createContext(null);

const STORAGE_KEY = 'flowra_navigation';

/**
 * Get initial state from localStorage or defaults
 */
const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to parse navigation state from localStorage');
  }
  return {
    activeModule: 'projects',
    activeProjectId: null,
    activeBoardId: null,
  };
};

/**
 * NavigationProvider component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const NavigationProvider = ({ children }) => {
  const initialState = getInitialState();

  const [activeProjectId, setActiveProjectId] = useState(initialState.activeProjectId);
  const [activeModule, setActiveModule] = useState(initialState.activeModule);
  const [activeBoardId, setActiveBoardId] = useState(initialState.activeBoardId);
  const [activeCardId, setActiveCardId] = useState(null);

  // Persist navigation state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      activeModule,
      activeProjectId,
      activeBoardId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [activeModule, activeProjectId, activeBoardId]);

  /**
   * Navigates to a specific module
   * @param {string} module - Module ID
   */
  const navigateTo = (module) => {
    setActiveModule(module);
    // Only clear activeBoardId if navigating away from kanban module
    // This allows staying in a board when clicking "Kanban" menu item
    if (module !== 'kanban') {
      setActiveBoardId(null);
      setActiveCardId(null);
    }
  };

  /**
   * Selects a project and navigates to dashboard
   * @param {string} projectId - Project ID
   */
  const selectProject = (projectId) => {
    setActiveProjectId(projectId);
    setActiveModule('projects');
    setActiveBoardId(null);
    setActiveCardId(null);
  };

  /**
   * Activates project context without changing module
   * @param {string} projectId - Project ID
   */
  const activateProjectContext = (projectId) => {
    setActiveProjectId(projectId);
  };

  /**
   * Navigates to a specific board
   * @param {string} projectId - Project ID
   * @param {string} boardId - Board ID
   */
  const goToBoard = (projectId, boardId) => {
    setActiveProjectId(projectId);
    setActiveModule('kanban');
    setActiveBoardId(boardId);
    setActiveCardId(null);
  };

  /**
   * Navigates to a specific card
   */
  const navigateToCard = (projectId, boardId, cardId) => {

    setActiveProjectId(projectId);
    setActiveModule('kanban');
    setActiveBoardId(boardId);
    setActiveCardId(cardId);
  };

  /**
   * Exits current project context
   */
  const exitProject = () => {
    setActiveProjectId(null);
    setActiveModule('projects');
    setActiveBoardId(null);
    setActiveCardId(null);
  };

  const value = {
    activeProjectId,
    activeModule,
    activeBoardId,
    activeCardId,
    setActiveProjectId,
    setActiveModule,
    setActiveBoardId,
    setActiveCardId,
    navigateTo,
    selectProject,
    activateProjectContext,
    goToBoard,
    navigateToCard,
    exitProject,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * Hook to access NavigationContext
 * @returns {Object} Context value
 */
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export default NavigationContext;

