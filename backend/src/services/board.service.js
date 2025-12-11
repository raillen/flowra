import { NotFoundError } from '../utils/errors.js';
import { boardRepository } from '../repositories/board.repository.js';
import { projectRepository } from '../repositories/project.repository.js';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Board service layer
 * Contains business logic for board operations
 * 
 * @module services/board
 */

/**
 * Creates a new board
 * @param {string} projectId - Project ID
 * @param {Object} boardData - Board data
 * @param {string} boardData.name - Board name
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Created board
 * @throws {NotFoundError} If project not found
 */
export async function createBoard(projectId, boardData, userId) {
  logger.debug({ projectId, boardData }, 'Creating board');

  // Verify project exists and user owns it
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user is owner OR member of project
  if (project.userId !== userId) {
    const member = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
    if (!member) throw new NotFoundError('Project not found');
  }

  const board = await boardRepository.create({
    ...boardData,
    projectId,
  });

  logger.info({ boardId: board.id }, 'Board created successfully');
  return board;
}

/**
 * Retrieves a board by ID
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Board object
 * @throws {NotFoundError} If board not found
 */
export async function getBoardById(projectId, boardId, userId) {
  // Verify project ownership
  const board = await verifyBoardAccess(projectId, boardId, userId);

  // Extract cards from columns and flatten them to root level
  // This is needed because frontend expects board.cards to be a flat array
  const cards = [];
  if (board.columns && Array.isArray(board.columns)) {
    board.columns.forEach(column => {
      if (column.cards && Array.isArray(column.cards)) {
        cards.push(...column.cards);
      }
    });
  }

  // Return board with cards at root level
  return {
    ...board,
    cards,
  };
}

/**
 * Lists all boards for a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Array>} Array of boards
 * @throws {NotFoundError} If project not found
 */
export async function listBoards(projectId, userId) {
  // Verify project ownership
  const boards = await boardRepository.findByProjectId(projectId, userId);
  return boards;
}

/**
 * Updates an existing board
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {Object} updateData - Data to update
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Updated board
 * @throws {NotFoundError} If board not found
 */
export async function updateBoard(projectId, boardId, updateData, userId) {
  // Verify ownership
  // Verify ownership/admin rights
  await verifyBoardAccess(projectId, boardId, userId, true);

  const updated = await boardRepository.update(boardId, updateData);

  logger.info({ boardId }, 'Board updated successfully');
  return updated;
}

/**
 * Deletes a board
 * @param {string} projectId - Project ID
 * @param {string} boardId - Board ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<void>}
 * @throws {NotFoundError} If board not found
 */
export async function deleteBoard(projectId, boardId, userId) {
  // Verify ownership
  // Verify ownership/admin rights
  await verifyBoardAccess(projectId, boardId, userId, true);

  await boardRepository.delete(boardId);

  logger.info({ boardId }, 'Board deleted successfully');
}


/**
 * Verifies board access rights
 * @param {string} projectId 
 * @param {string} boardId 
 * @param {string} userId 
 * @param {boolean} requireAdmin - If true, requires project ownership or specific admin rights
 * @returns {Promise<Object>} Board object if accessible
 */
async function verifyBoardAccess(projectId, boardId, userId, requireAdmin = false) {
  const board = await boardRepository.findById(boardId);
  if (!board || board.projectId !== projectId) throw new NotFoundError('Board not found');

  const project = await projectRepository.findById(projectId);
  if (!project) throw new NotFoundError('Project not found');

  // Owner always has access
  if (project.userId === userId) return board;

  // If requires admin (e.g. delete board), only owner (for now)
  if (requireAdmin) {
    if (project.userId !== userId) throw new NotFoundError('Board not found');
    return board;
  }

  // Check board specific access
  if (!board.isPrivate) {
    // Public board: Project Members should have access
    // We need to check if user is a member of the project
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (!member) throw new NotFoundError('Board not found');
  } else {
    // Private board: Must be Board Member (or Project Owner checked above)
    // Board Member check
    const member = await prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } }
    });
    if (!member) throw new NotFoundError('Board not found');
  }

  return board;
}

/**
 * Add member to board
 */
export async function addMember(projectId, boardId, userId, targetUserId) {
  await verifyBoardAccess(projectId, boardId, userId, true); // Only owner/admin can add
  return boardRepository.addMember(boardId, targetUserId);
}

/**
 * Remove member from board
 */
export async function removeMember(projectId, boardId, userId, targetUserId) {
  await verifyBoardAccess(projectId, boardId, userId, true);
  return boardRepository.removeMember(boardId, targetUserId);
}
