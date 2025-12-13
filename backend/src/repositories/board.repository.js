import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Board repository layer
 * Handles all database operations for boards
 * 
 * @module repositories/board
 */

/**
 * Creates a new board
 * @param {Object} data - Board data
 * @returns {Promise<Object>} Created board
 */
export async function create(data) {
  try {
    // Create board with default columns
    const board = await prisma.board.create({
      data: {
        name: data.name,
        projectId: data.projectId,
        isPrivate: data.isPrivate || false,
        columns: {
          create: [
            { title: 'A Fazer', color: 'bg-slate-100', order: 1 },
            { title: 'Em Andamento', color: 'bg-blue-50', order: 2 },
            { title: 'Concluído', color: 'bg-green-50', order: 3 },
          ],
        },
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
        },
        cards: true,
      },
    });

    return board;
  } catch (error) {
    logger.error({ error, data }, 'Failed to create board');
    throw error;
  }
}

/**
 * Finds a board by ID
 * @param {string} id - Board ID
 * @returns {Promise<Object|null>} Board or null if not found
 */
export async function findById(id) {
  return prisma.board.findUnique({
    where: { id },
    include: {
      columns: {
        orderBy: { order: 'asc' },
        include: {
          cards: {
            where: { archivedAt: null }, // Only show non-archived cards
            include: {
              assignedUser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              tags: {
                include: {
                  tag: true,
                },
              },
              _count: {
                select: {
                  comments: true,
                  attachments: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
      tags: {
        orderBy: { name: 'asc' },
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
      project: {
        select: {
          id: true,
          name: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        },
      },
    },
  });
}

/**
 * Finds all boards for a project visible to user
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID requesting access
 * @returns {Promise<Array>} Array of boards
 */
export async function findByProjectId(projectId, userId) {
  return prisma.board.findMany({
    where: {
      projectId,
      OR: [
        { isPrivate: false },
        { members: { some: { userId } } },
        { project: { userId } } // Project owner always sees all
      ]
    },
    include: {
      columns: {
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: {
              cards: true,
            },
          },
        },
      },
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
      },
      project: {
        select: {
          id: true,
          name: true,
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
          cards: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Updates a board
 * @param {string} id - Board ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated board
 */
export async function update(id, data) {
  return prisma.board.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.isPrivate !== undefined && { isPrivate: data.isPrivate }),
    },
    include: {
      columns: {
        orderBy: { order: 'asc' },
      },
      cards: true,
    },
  });
}

/**
 * Deletes a board
 * @param {string} id - Board ID
 * @returns {Promise<Object>} Deleted board
 */
export async function deleteBoard(id) {
  return prisma.board.delete({
    where: { id },
  });
}

export async function addMember(boardId, userId, role = 'editor') {
  return prisma.boardMember.create({
    data: { boardId, userId, role }
  });
}

export async function removeMember(boardId, userId) {
  return prisma.boardMember.deleteMany({
    where: { boardId, userId }
  });
}

export const boardRepository = {
  create,
  findById,
  findByProjectId,
  update,
  delete: deleteBoard,
  addMember,
  removeMember,
};

