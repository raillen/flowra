import api from '../config/api';

/**
 * Authentication service for API communication
 * Handles all authentication-related API calls
 * 
 * @module services/authService
 */

/**
 * Registers a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} User data and token
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  // Backend retorna: { success: true, data: { user, token }, message: ... }
  // Extrair { user, token } de response.data.data
  if (response.data && response.data.data) {
    return response.data.data;
  }
  // Fallback caso a estrutura seja diferente
  return response.data;
};

/**
 * Authenticates a user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} User data and token
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  // Backend retorna: { success: true, data: { user, token }, message: ... }
  // Extrair { user, token } de response.data.data
  if (response.data && response.data.data) {
    return response.data.data;
  }
  // Fallback caso a estrutura seja diferente
  return response.data;
};

/**
 * Gets current authenticated user
 * @returns {Promise<Object>} User data
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  // Backend retorna: { success: true, data: user, ... }
  // Extrair user de response.data.data
  if (response.data && response.data.data) {
    return response.data.data;
  }
  // Fallback caso a estrutura seja diferente
  return response.data;
};

/**
 * Logs out the current user
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Updates the current user's profile
 * @param {Object} updateData - Data to update
 * @param {string} [updateData.name] - New name
 * @param {string} [updateData.email] - New email
 * @param {string} [updateData.currentPassword] - Current password (required for password change)
 * @param {string} [updateData.newPassword] - New password
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (updateData) => {
  const response = await api.put('/auth/me', updateData);
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

/**
 * Search users by name or email
 * @param {string} query - Search query
 * @returns {Promise<Array>} List of users
 */
export const searchUsers = async (query) => {
  const response = await api.get(`/auth/users?q=${encodeURIComponent(query)}`);
  return response.data.data || response.data;
};
