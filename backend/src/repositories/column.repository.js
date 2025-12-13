import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Column repository layer
 * Handles all database operations for columns
 * 
 * @module repositories/column
 */

/**
 * Creates a new column
 * @param {Object} data - Column data
 * @returns {Promise<Object>} Created column
 */
export async function create(data) {
  try {
    const column = await prisma.column.create({
      data: {
        title: data.title,
        color: data.color || 'bg-slate-100',
        order: data.order || 0,
        boardId: data.boardId,
      },
      include: {
        cards: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return column;
  } catch (error) {
    logger.error({ error, data }, 'Failed to create column');
    throw error;
  }
}

/**
 * Finds a column by ID
 * @param {string} id - Column ID
 * @returns {Promise<Object|null>} Column or null if not found
 */
export async function findById(id) {
  try {
    const column = await prisma.column.findUnique({
      where: { id },
      include: {
        cards: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return column;
  } catch (error) {
    logger.error({ error, id }, 'Failed to find column');
    throw error;
  }
}

/**
 * Finds all columns for a board
 * @param {string} boardId - Board ID
 * @returns {Promise<Array>} Array of columns
 */
export async function findByBoardId(boardId) {
  try {
    const columns = await prisma.column.findMany({
      where: { boardId },
      include: {
        cards: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return columns;
  } catch (error) {
    logger.error({ error, boardId }, 'Failed to find columns by board');
    throw error;
  }
}

/**
 * Updates a column
 * @param {string} id - Column ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated column
 */
export async function update(id, data) {
  try {
    const column = await prisma.column.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.autoArchive !== undefined && { autoArchive: data.autoArchive }),
        ...(data.archiveAfterMinutes !== undefined && { archiveAfterMinutes: data.archiveAfterMinutes }),
      },
      include: {
        cards: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return column;
  } catch (error) {
    logger.error({ error, id, data }, 'Failed to update column');
    throw error;
  }
}

/**
 * Deletes a column
 * @param {string} id - Column ID
 * @returns {Promise<void>}
 */
export async function deleteColumn(id) {
  try {
    await prisma.column.delete({
      where: { id },
    });
  } catch (error) {
    logger.error({ error, id }, 'Failed to delete column');
    throw error;
  }
}

/**
 * Updates column order
 * @param {Array<{id: string, order: number}>} columns - Array of column updates
 * @returns {Promise<void>}
 */
export async function updateOrder(columns) {
  try {
    await Promise.all(
      columns.map(({ id, order }) =>
        prisma.column.update({
          where: { id },
          data: { order },
        })
      )
    );
  } catch (error) {
    logger.error({ error, columns }, 'Failed to update column order');
    throw error;
  }
}

export const columnRepository = {
  create,
  findById,
  findByBoardId,
  update,
  delete: deleteColumn,
  updateOrder,
};

