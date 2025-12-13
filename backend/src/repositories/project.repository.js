import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Project repository layer
 * Handles all database operations for projects
 * 
 * @module repositories/project
 */

/**
 * Creates a new project in the database
 * @param {Object} data - Project data
 * @returns {Promise<Object>} Created project
 */
export async function create(data) {
  try {
    return await prisma.project.create({
      data: {
        name: data.name,
        description: data.description || null,
        companyId: data.companyId || null,
        groupId: data.groupId || null,
        userId: data.userId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        boards: {
          include: {
            _count: {
              select: {
                cards: true,
              },
            },
          },
        },
        _count: {
          select: {
            boards: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create project');
    throw error;
  }
}

/**
 * Finds a project by ID
 * @param {string} id - Project ID
 * @returns {Promise<Object|null>} Project or null if not found
 */
export async function findById(id) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      company: true,
      group: true,
      boards: {
        include: {
          columns: true,
          _count: {
            select: {
              cards: true,
            },
          },
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        }
      }
    },
  });
}

/**
 * Finds a project by name and user ID
 * @param {string} name - Project name
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Project or null if not found
 */
export async function findByNameAndUser(name, userId) {
  return prisma.project.findFirst({
    where: {
      name,
      userId,
    },
  });
}

/**
 * Finds all projects for a user with pagination
 * @param {string} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} Array of projects
 */
export async function findByUserId(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  return prisma.project.findMany({
    where: {
      OR: [
        { userId },
        { members: { some: { userId } } }
      ]
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      boards: { // [NEW] Fetch boards for Sidebar navigation
        select: {
          id: true,
          name: true
        }
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      },
      _count: {
        select: {
          boards: true,
        },
      },
    },
  });
}

/**
 * Counts projects for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Total count
 */
export async function countByUserId(userId) {
  return prisma.project.count({
    where: {
      OR: [
        { userId },
        { members: { some: { userId } } }
      ]
    },
  });
}

/**
 * Updates a project
 * @param {string} id - Project ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated project
 */
export async function update(id, data) {
  return prisma.project.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.companyId !== undefined && { companyId: data.companyId }),
      ...(data.groupId !== undefined && { groupId: data.groupId }),
    },
    include: {
      company: true,
      group: true,
      boards: {
        include: {
          _count: {
            select: {
              cards: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Deletes a project
 * @param {string} id - Project ID
 * @returns {Promise<Object>} Deleted project
 */
export async function deleteProject(id) {
  return prisma.project.delete({
    where: { id },
  });
}

/**
 * Adds a member to a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {string} role - Role (default: member)
 * @returns {Promise<Object>} Created project member
 */
export async function addMember(projectId, userId, role = 'member') {
  return prisma.projectMember.create({
    data: {
      projectId,
      userId,
      role,
    },
  });
}

/**
 * Removes a member from a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deleted project member
 */
export async function removeMember(projectId, userId) {
  return prisma.projectMember.delete({
    where: {
      userId_projectId: {
        projectId,
        userId,
      },
    },
  });
}

export const projectRepository = {
  create,
  findById,
  findByNameAndUser,
  findByUserId,
  countByUserId,
  update,
  delete: deleteProject,
  addMember,
  removeMember,
};

