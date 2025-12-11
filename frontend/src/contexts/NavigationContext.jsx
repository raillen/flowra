import React, { createContext, useContext, useState } from 'react';

/**
 * Navigation context for managing application navigation state
 * Tracks active module, project, and board
 * 
 * @module contexts/NavigationContext
 */

const NavigationContext = createContext(null);

/**
 * NavigationProvider component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const NavigationProvider = ({ children }) => {
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeModule, setActiveModule] = useState('projects');
  const [activeBoardId, setActiveBoardId] = useState(null);

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
  };

  /**
   * Exits current project context
   */
  const exitProject = () => {
    setActiveProjectId(null);
    setActiveModule('projects');
    setActiveBoardId(null);
  };

  const value = {
    activeProjectId,
    activeModule,
    activeBoardId,
    setActiveProjectId,
    setActiveModule,
    setActiveBoardId,
    navigateTo,
    selectProject,
    activateProjectContext,
    goToBoard,
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

