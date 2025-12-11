import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Group repository layer
 * Handles all database operations for groups
 * 
 * @module repositories/group
 */

/**
 * Creates a new group
 * @param {Object} data - Group data
 * @returns {Promise<Object>} Created group
 */
export async function create(data) {
  try {
    return await prisma.group.create({
      data: {
        name: data.name,
      },
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create group');
    throw error;
  }
}

/**
 * Finds a group by ID
 * @param {string} id - Group ID
 * @returns {Promise<Object|null>} Group or null if not found
 */
export async function findById(id) {
  return prisma.group.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          projects: true,
          collaborators: true,
        },
      },
    },
  });
}

/**
 * Finds a group by name
 * @param {string} name - Group name
 * @returns {Promise<Object|null>} Group or null if not found
 */
export async function findByName(name) {
  return prisma.group.findFirst({
    where: { name },
  });
}

/**
 * Lists all groups
 * @returns {Promise<Array>} Array of groups
 */
export async function findAll() {
  return prisma.group.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          projects: true,
          collaborators: true,
        },
      },
    },
  });
}

/**
 * Updates a group
 * @param {string} id - Group ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated group
 */
export async function update(id, data) {
  return prisma.group.update({
    where: { id },
    data: {
      name: data.name,
    },
  });
}

/**
 * Deletes a group
 * @param {string} id - Group ID
 * @returns {Promise<Object>} Deleted group
 */
export async function deleteGroup(id) {
  return prisma.group.delete({
    where: { id },
  });
}

export const groupRepository = {
  create,
  findById,
  findByName,
  findAll,
  update,
  delete: deleteGroup,
};

