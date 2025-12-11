import { NotFoundError, ConflictError } from '../utils/errors.js';
import { groupRepository } from '../repositories/group.repository.js';
import { logger } from '../config/logger.js';

/**
 * Group service layer
 * Contains business logic for group operations
 * 
 * @module services/group
 */

/**
 * Creates a new group
 * @param {Object} groupData - Group data
 * @returns {Promise<Object>} Created group
 * @throws {ConflictError} If group name already exists
 */
export async function createGroup(groupData) {
  logger.debug({ groupData }, 'Creating group');
  
  // Check for duplicate name
  const existing = await groupRepository.findByName(groupData.name);
  if (existing) {
    throw new ConflictError('Group with this name already exists');
  }
  
  const group = await groupRepository.create(groupData);
  
  logger.info({ groupId: group.id }, 'Group created successfully');
  return group;
}

/**
 * Retrieves a group by ID
 * @param {string} groupId - Group ID
 * @returns {Promise<Object>} Group object
 * @throws {NotFoundError} If group not found
 */
export async function getGroupById(groupId) {
  const group = await groupRepository.findById(groupId);
  
  if (!group) {
    throw new NotFoundError('Group not found');
  }
  
  return group;
}

/**
 * Lists all groups
 * @returns {Promise<Array>} Array of groups
 */
export async function listGroups() {
  const groups = await groupRepository.findAll();
  return groups;
}

/**
 * Updates an existing group
 * @param {string} groupId - Group ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated group
 * @throws {NotFoundError} If group not found
 * @throws {ConflictError} If new name already exists
 */
export async function updateGroup(groupId, updateData) {
  // Verify group exists
  await getGroupById(groupId);
  
  // If name is being updated, check for conflicts
  if (updateData.name) {
    const existing = await groupRepository.findByName(updateData.name);
    if (existing && existing.id !== groupId) {
      throw new ConflictError('Group name already exists');
    }
  }
  
  const updated = await groupRepository.update(groupId, updateData);
  
  logger.info({ groupId }, 'Group updated successfully');
  return updated;
}

/**
 * Deletes a group
 * @param {string} groupId - Group ID
 * @returns {Promise<void>}
 * @throws {NotFoundError} If group not found
 */
export async function deleteGroup(groupId) {
  // Verify group exists
  await getGroupById(groupId);
  
  await groupRepository.delete(groupId);
  
  logger.info({ groupId }, 'Group deleted successfully');
}

