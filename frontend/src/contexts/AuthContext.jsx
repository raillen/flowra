import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * Authentication context
 * Provides authentication state and methods throughout the app
 * 
 * @module contexts/AuthContext
 */

const AuthContext = createContext(null);

/**
 * AuthProvider component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access AuthContext
 * @returns {Object} Auth context value
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;

