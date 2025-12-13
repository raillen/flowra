import bcrypt from 'bcryptjs';
import { UnauthorizedError, ConflictError } from '../utils/errors.js';
import { userRepository } from '../repositories/user.repository.js';
import { companyRepository } from '../repositories/company.repository.js';
import { logger } from '../config/logger.js';

/**
 * Authentication service layer
 * Contains business logic for authentication operations
 * 
 * @module services/auth
 */

/**
 * Registers a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.password - Plain text password
 * @param {string} [userData.companyName] - Optional company name to create
 * @returns {Promise<Object>} Created user (without password)
 * @throws {ConflictError} If email already exists
 */
export async function register(userData) {
  logger.debug({ email: userData.email }, 'Registering new user');

  // Check if user already exists
  const existingUser = await userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  let companyId = null;

  // Create company if provided
  if (userData.companyName) {
    try {
      const company = await companyRepository.create({
        name: userData.companyName,
        cnpj: null // Allow creation without CNPJ initially
      });
      companyId = company.id;
      logger.info({ companyId, name: userData.companyName }, 'Auto-created company for new user');
    } catch (error) {
      logger.error({ error }, 'Failed to auto-create company during registration');
      // Continue without company? or throw? 
      // User expects company. throwing is better.
      throw new Error('Failed to create company');
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create user
  const user = await userRepository.create({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    companyId: companyId
  });

  logger.info({ userId: user.id, companyId }, 'User registered successfully');
  return user;
}

/**
 * Authenticates a user and returns user data
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} User data (without password)
 * @throws {UnauthorizedError} If credentials are invalid
 */
export async function login(email, password) {
  logger.debug({ email }, 'Attempting login');

  // Find user by email
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;

  logger.info({ userId: user.id }, 'User logged in successfully');
  return userWithoutPassword;
}

/**
 * Gets user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 * @throws {NotFoundError} If user not found
 */
export async function getUserById(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  return user;
}

/**
 * Updates user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @param {string} [updateData.name] - New name
 * @param {string} [updateData.email] - New email
 * @param {string} [updateData.currentPassword] - Current password (required for password change)
 * @param {string} [updateData.newPassword] - New password
 * @returns {Promise<Object>} Updated user (without password)
 * @throws {UnauthorizedError} If current password is incorrect
 * @throws {ConflictError} If new email already exists
 */
export async function updateUser(userId, updateData) {
  logger.debug({ userId }, 'Updating user profile');

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  const updatePayload = {};

  // Update name if provided
  if (updateData.name) {
    updatePayload.name = updateData.name;
  }

  // Update email if provided
  if (updateData.email && updateData.email !== user.email) {
    const existingUser = await userRepository.findByEmail(updateData.email);
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }
    updatePayload.email = updateData.email;
  }

  // Update password if provided
  if (updateData.newPassword) {
    // Verify current password
    const isPasswordValid = await bcrypt.compare(updateData.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }
    updatePayload.password = await bcrypt.hash(updateData.newPassword, 10);
  }

  // Only update if there are changes
  if (Object.keys(updatePayload).length === 0) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  const updatedUser = await userRepository.update(userId, updatePayload);

  logger.info({ userId }, 'User profile updated successfully');
  return updatedUser;
}

/**
 * Search users
 */
export async function searchUsers(query) {
  return userRepository.search(query);
}
