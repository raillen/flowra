import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * User repository layer
 * Handles all database operations for users
 * 
 * @module repositories/user
 */

/**
 * Finds a user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User or null if not found
 */
export async function findByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          accentColor: true
        }
      }
    }
  });
}

/**
 * Finds a user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} User or null if not found
 */
export async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      bio: true,
      avatar: true,
      companyId: true,
      createdAt: true,
      updatedAt: true,
      company: {
        select: {
          id: true,
          name: true,
          accentColor: true
        }
      }
    },
  });
}

/**
 * Creates a new user
 * @param {Object} data - User data
 * @param {string} data.email - User email
 * @param {string} data.name - User name
 * @param {string} data.password - Hashed password
 * @returns {Promise<Object>} Created user (without password)
 */
export async function create(data) {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role || 'user',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  } catch (error) {
    logger.error({ error, data }, 'Failed to create user');
    throw error;
  }
}

/**
 * Updates a user
 * @param {string} id - User ID
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} Updated user (without password)
 */
export async function update(id, data) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  } catch (error) {
    logger.error({ error, id, data }, 'Failed to update user');
    throw error;
  }
}


/**
 * Search users by name or email
 * @param {string} query - Search query
 * @returns {Promise<Array>} List of matching users
 */
export async function search(query) {
  if (!query) return [];
  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
    },
    take: 10,
  });
}

/**
 * Get user productivity stats
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Stats object
 */
export async function getStats(userId) {
  const [
    tasksCompleted,
    tasksPending,
    tasksInProgress,
    projectsCount,
    boardsCount
  ] = await Promise.all([
    prisma.card.count({
      where: {
        assignedUserId: userId,
        status: { in: ['concluido', 'completed', 'done'] }
      }
    }),
    prisma.card.count({
      where: {
        assignedUserId: userId,
        status: { notIn: ['concluido', 'completed', 'done'] }
      }
    }),
    prisma.card.count({
      where: {
        assignedUserId: userId,
        status: 'em_progresso'
      }
    }),
    prisma.project.count({
      where: {
        OR: [{ userId }, { members: { some: { userId } } }]
      }
    }),
    prisma.board.count({
      where: {
        OR: [
          { isPrivate: false },
          { members: { some: { userId } } },
          { project: { userId } }
        ]
      }
    })
  ]);

  return {
    tasksCompleted,
    tasksPending,
    tasksInProgress,
    projectsCount,
    boardsCount
  };
}

export const userRepository = {
  findByEmail,
  findById,
  create,
  update,
  search,
  getStats,
};
