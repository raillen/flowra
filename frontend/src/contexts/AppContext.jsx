import React, { createContext, useContext } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useCompanies } from '../hooks/useCompanies';
import { useGroups } from '../hooks/useGroups';
import { useCollaborators } from '../hooks/useCollaborators';
import { getStorageItem } from '../utils/localStorage';

/**
 * Application context for global state management
 * Manages projects, companies, groups, collaborators, and user data
 * 
 * @module contexts/AppContext
 */

const AppContext = createContext(null);

/**
 * Initial data for the application
 */
const initialData = {
  projects: [],
  companies: [],
  groups: [],
  collaborators: [],
  user: {
    name: 'Administrador',
    email: 'admin@sistema.com',
    role: 'Super Admin',
    department: 'Gestão',
    joinDate: '2023-01-15',
  },
};

/**
 * AppContext Provider component
 * Integrates all data hooks and provides unified state
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const AppProvider = ({ children }) => {
  // Use API hooks instead of localStorage
  const projectsHook = useProjects();
  const companiesHook = useCompanies();
  const groupsHook = useGroups();
  const collaboratorsHook = useCollaborators();

  // Get user from auth context (will be set by AuthProvider)
  const user = getStorageItem('user', initialData.user);

  const value = {
    // Projects
    projects: projectsHook.projects,
    setProjects: (newProjects) => {
      // This is a compatibility function for components that still use setProjects
      // In practice, components should use projectsHook.addProject, etc.
    },
    projectsLoading: projectsHook.loading,
    projectsError: projectsHook.error,
    addProject: projectsHook.addProject,
    updateProject: projectsHook.updateProject,
    deleteProject: projectsHook.deleteProject,
    fetchProjects: projectsHook.fetchProjects,

    // Companies
    companies: companiesHook.companies,
    setCompanies: () => {}, // Compatibility
    companiesLoading: companiesHook.loading,
    companiesError: companiesHook.error,
    addCompany: companiesHook.addCompany,
    updateCompany: companiesHook.updateCompany,
    deleteCompany: companiesHook.deleteCompany,
    fetchCompanies: companiesHook.fetchCompanies,

    // Groups
    groups: groupsHook.groups,
    setGroups: () => {}, // Compatibility
    groupsLoading: groupsHook.loading,
    groupsError: groupsHook.error,
    addGroup: groupsHook.addGroup,
    updateGroup: groupsHook.updateGroup,
    deleteGroup: groupsHook.deleteGroup,
    fetchGroups: groupsHook.fetchGroups,

    // Collaborators
    collaborators: collaboratorsHook.collaborators,
    setCollaborators: () => {}, // Compatibility
    collaboratorsLoading: collaboratorsHook.loading,
    collaboratorsError: collaboratorsHook.error,
    addCollaborator: collaboratorsHook.addCollaborator,
    updateCollaborator: collaboratorsHook.updateCollaborator,
    deleteCollaborator: collaboratorsHook.deleteCollaborator,
    fetchCollaborators: collaboratorsHook.fetchCollaborators,

    // User (from auth)
    user,
    setUser: () => {}, // User is managed by AuthContext
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook to access AppContext
 * @returns {Object} Context value
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;

