import { useState, useEffect } from 'react';
import { login as loginService, register as registerService, getMe, logout as logoutService } from '../services/authService';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/localStorage';

/**
 * Custom hook for authentication
 * Manages user authentication state and operations
 * 
 * @module hooks/useAuth
 * @returns {Object} Auth state and operations
 */
export const useAuth = () => {
  const [user, setUser] = useState(() => getStorageItem('user', null));
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Checks if user is authenticated
   */
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await getMe();
          // getMe já extrai response.data.data, então response já é o user
          const userData = response;
          setUser(userData);
          setStorageItem('user', userData);
        } catch (err) {
          // Token inválido, limpar
          setToken(null);
          setUser(null);
          removeStorageItem('user');
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  /**
   * Logs in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await loginService({ email, password });

      // loginService já extrai response.data.data, então response já é { user, token }
      const { user: userData, token: authToken } = response;

      if (!userData || !authToken) {
        throw new Error('Resposta inválida do servidor');
      }

      setUser(userData);
      setToken(authToken);
      setStorageItem('user', userData);
      localStorage.setItem('authToken', authToken);

      return { user: userData, token: authToken };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao fazer login';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registers a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data and token
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await registerService(userData);

      // registerService já extrai response.data.data, então response já é { user, token }
      const { user: newUser, token: authToken } = response;

      setUser(newUser);
      setToken(authToken);
      setStorageItem('user', newUser);
      localStorage.setItem('authToken', authToken);

      return { user: newUser, token: authToken };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao registrar';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs out the current user
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    removeStorageItem('user');
    logoutService();
  };

  /**
   * Checks if user is authenticated
   * @returns {boolean}
   */
  const isAuthenticated = !!user && !!token;

  return {
    user,
    setUser,
    token,
    setToken,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  };
};

