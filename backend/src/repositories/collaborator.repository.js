import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Collaborator repository layer
 * Handles all database operations for collaborators
 * 
 * @module repositories/collaborator
 */

/**
 * Creates a new collaborator
 * @param {Object} data - Collaborator data
 * @returns {Promise<Object>} Created collaborator
 */
export async function create(data) {
  try {
    const { companyIds = [], groupIds = [], ...collaboratorData } = data;
    
    return await prisma.collaborator.create({
      data: {
        ...collaboratorData,
        companies: {
          create: companyIds.map(companyId => ({
            company: { connect: { id: companyId } },
          })),
        },
        groups: {
          create: groupIds.map(groupId => ({
            group: { connect: { id: groupId } },
          })),
        },
      },
      include: {
        companies: {
          include: {
            company: true,
          },
        },
        groups: {
          include: {
            group: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create collaborator');
    throw error;
  }
}

/**
 * Finds a collaborator by ID
 * @param {string} id - Collaborator ID
 * @returns {Promise<Object|null>} Collaborator or null if not found
 */
export async function findById(id) {
  return prisma.collaborator.findUnique({
    where: { id },
    include: {
      companies: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      groups: {
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Finds a collaborator by email
 * @param {string} email - Collaborator email
 * @returns {Promise<Object|null>} Collaborator or null if not found
 */
export async function findByEmail(email) {
  return prisma.collaborator.findUnique({
    where: { email },
  });
}

/**
 * Lists all collaborators with pagination
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} Array of collaborators
 */
export async function findAll(options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  
  return prisma.collaborator.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      companies: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      groups: {
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Counts all collaborators
 * @returns {Promise<number>} Total count
 */
export async function count() {
  return prisma.collaborator.count();
}

/**
 * Updates a collaborator
 * @param {string} id - Collaborator ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated collaborator
 */
export async function update(id, data) {
  const { companyIds, groupIds, ...updateData } = data;
  
  // Update basic fields
  const collaborator = await prisma.collaborator.update({
    where: { id },
    data: updateData,
  });
  
  // Update relationships if provided
  if (companyIds !== undefined) {
    // Delete existing relationships
    await prisma.collaboratorCompany.deleteMany({
      where: { collaboratorId: id },
    });
    
    // Create new relationships
    if (companyIds.length > 0) {
      await prisma.collaboratorCompany.createMany({
        data: companyIds.map(companyId => ({
          collaboratorId: id,
          companyId,
        })),
      });
    }
  }
  
  if (groupIds !== undefined) {
    // Delete existing relationships
    await prisma.collaboratorGroup.deleteMany({
      where: { collaboratorId: id },
    });
    
    // Create new relationships
    if (groupIds.length > 0) {
      await prisma.collaboratorGroup.createMany({
        data: groupIds.map(groupId => ({
          collaboratorId: id,
          groupId,
        })),
      });
    }
  }
  
  // Return updated collaborator with relationships
  return findById(id);
}

/**
 * Deletes a collaborator
 * @param {string} id - Collaborator ID
 * @returns {Promise<Object>} Deleted collaborator
 */
export async function deleteCollaborator(id) {
  return prisma.collaborator.delete({
    where: { id },
  });
}

export const collaboratorRepository = {
  create,
  findById,
  findByEmail,
  findAll,
  count,
  update,
  delete: deleteCollaborator,
};

