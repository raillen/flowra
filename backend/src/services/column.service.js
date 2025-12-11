import { NotFoundError } from '../utils/errors.js';
import { columnRepository } from '../repositories/column.repository.js';
import { boardRepository } from '../repositories/board.repository.js';
import { logger } from '../config/logger.js';

/**
 * Column service layer
 * Contains business logic for column operations
 * 
 * @module services/column
 */

/**
 * Creates a new column
 * @param {string} boardId - Board ID
 * @param {Object} columnData - Column data
 * @returns {Promise<Object>} Created column
 */
export async function createColumn(boardId, columnData) {
  logger.debug({ boardId, columnData }, 'Creating column');
  
  // Verify board exists
  const board = await boardRepository.findById(boardId);
  if (!board) {
    throw new NotFoundError('Board not found');
  }
  
  // Get max order to place new column at the end
  const existingColumns = await columnRepository.findByBoardId(boardId);
  const maxOrder = existingColumns.length > 0
    ? Math.max(...existingColumns.map(c => c.order))
    : -1;
  
  const column = await columnRepository.create({
    ...columnData,
    boardId,
    order: columnData.order !== undefined ? columnData.order : maxOrder + 1,
  });
  
  logger.info({ columnId: column.id, boardId }, 'Column created successfully');
  return column;
}

/**
 * Retrieves a column by ID
 * @param {string} boardId - Board ID
 * @param {string} columnId - Column ID
 * @returns {Promise<Object>} Column object
 * @throws {NotFoundError} If column not found
 */
export async function getColumnById(boardId, columnId) {
  const column = await columnRepository.findById(columnId);
  
  if (!column) {
    throw new NotFoundError('Column not found');
  }
  
  if (column.boardId !== boardId) {
    throw new NotFoundError('Column does not belong to this board');
  }
  
  return column;
}

/**
 * Lists all columns for a board
 * @param {string} boardId - Board ID
 * @returns {Promise<Array>} Array of columns
 */
export async function listColumns(boardId) {
  // Verify board exists
  const board = await boardRepository.findById(boardId);
  if (!board) {
    throw new NotFoundError('Board not found');
  }
  
  const columns = await columnRepository.findByBoardId(boardId);
  return columns;
}

/**
 * Updates an existing column
 * @param {string} boardId - Board ID
 * @param {string} columnId - Column ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated column
 * @throws {NotFoundError} If column not found
 */
export async function updateColumn(boardId, columnId, updateData) {
  // Verify column exists and belongs to board
  await getColumnById(boardId, columnId);
  
  const updated = await columnRepository.update(columnId, updateData);
  
  logger.info({ columnId, boardId }, 'Column updated successfully');
  return updated;
}

/**
 * Deletes a column
 * @param {string} boardId - Board ID
 * @param {string} columnId - Column ID
 * @returns {Promise<void>}
 * @throws {NotFoundError} If column not found
 */
export async function deleteColumn(boardId, columnId) {
  // Verify column exists and belongs to board
  await getColumnById(boardId, columnId);
  
  await columnRepository.delete(columnId);
  
  logger.info({ columnId, boardId }, 'Column deleted successfully');
}

/**
 * Updates column order
 * @param {string} boardId - Board ID
 * @param {Array<{id: string, order: number}>} columns - Column order updates
 * @returns {Promise<void>}
 */
export async function updateColumnOrder(boardId, columns) {
  // Verify board exists
  const board = await boardRepository.findById(boardId);
  if (!board) {
    throw new NotFoundError('Board not found');
  }
  
  await columnRepository.updateOrder(columns);
  
  logger.info({ boardId, count: columns.length }, 'Column order updated');
}

