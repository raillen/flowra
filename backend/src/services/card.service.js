import { NotFoundError } from '../utils/errors.js';
import { cardRepository } from '../repositories/card.repository.js';
import { boardRepository } from '../repositories/board.repository.js';
import { columnRepository } from '../repositories/column.repository.js';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Card service layer
 * Contains business logic for card operations
 * 
 * @module services/card
 */

/**
 * Creates a new card with all extended fields
 * @param {string} boardId - Board ID
 * @param {string} columnId - Column ID
 * @param {Object} cardData - Card data
 * @returns {Promise<Object>} Created card
 */
export async function createCard(boardId, columnId, cardData) {
  logger.debug({ boardId, columnId, cardData }, 'Creating card');

  // Verify board exists
  const board = await boardRepository.findById(boardId);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  // Verify column exists and belongs to board
  const column = await columnRepository.findById(columnId);
  if (!column) {
    throw new NotFoundError('Column not found');
  }

  if (column.boardId !== boardId) {
    throw new NotFoundError('Column does not belong to this board');
  }

  // Handle custom fields serialization
  if (cardData.customFields && typeof cardData.customFields === 'object') {
    cardData.customFields = JSON.stringify(cardData.customFields);
  }

  const card = await cardRepository.create({
    ...cardData,
    columnId,
    boardId,
  });

  // Handle many-to-many relationships after card creation
  if (cardData.assigneeIds?.length > 0) {
    await updateCardAssignees(boardId, card.id, cardData.assigneeIds);
  }

  if (cardData.watcherIds?.length > 0) {
    await updateCardWatchers(boardId, card.id, cardData.watcherIds);
  }

  if (cardData.blockedByIds?.length > 0) {
    await updateCardBlockers(boardId, card.id, cardData.blockedByIds);
  }

  if (cardData.relatedToIds?.length > 0) {
    await updateCardRelations(boardId, card.id, cardData.relatedToIds);
  }

  logger.info({ cardId: card.id, boardId, columnId }, 'Card created successfully');
  return getCardById(boardId, card.id);
}

/**
 * Retrieves a card by ID with all relations
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @returns {Promise<Object>} Card object
 * @throws {NotFoundError} If card not found
 */
export async function getCardById(boardId, cardId) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      assignedUser: {
        select: { id: true, name: true, email: true },
      },
      reporter: {
        select: { id: true, name: true, email: true },
      },
      reviewer: {
        select: { id: true, name: true, email: true },
      },
      parentCard: {
        select: { id: true, title: true },
      },
      subtasks: {
        select: { id: true, title: true, status: true, progress: true },
        orderBy: { createdAt: 'asc' },
      },
      assignees: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      watchers: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      blockedBy: {
        include: {
          blockerCard: {
            select: { id: true, title: true, status: true },
          },
        },
      },
      blocking: {
        include: {
          blockedCard: {
            select: { id: true, title: true, status: true },
          },
        },
      },
      relatedFrom: {
        include: {
          toCard: {
            select: { id: true, title: true, status: true },
          },
        },
      },
      relatedTo: {
        include: {
          fromCard: {
            select: { id: true, title: true, status: true },
          },
        },
      },
      comments: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      attachments: {
        orderBy: { createdAt: 'desc' },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!card) {
    throw new NotFoundError('Card not found');
  }

  if (card.boardId !== boardId) {
    throw new NotFoundError('Card does not belong to this board');
  }

  // Parse customFields JSON
  const result = {
    ...card,
    customFields: card.customFields ? JSON.parse(card.customFields) : null,
    // Transform relations to simpler format
    assignees: card.assignees.map(a => a.user),
    watchers: card.watchers.map(w => w.user),
    blockedBy: card.blockedBy.map(b => b.blockerCard),
    blocking: card.blocking.map(b => b.blockedCard),
    relatedCards: [
      ...card.relatedFrom.map(r => r.toCard),
      ...card.relatedTo.map(r => r.fromCard),
    ],
  };

  return result;
}

/**
 * Lists all cards for a board
 * @param {string} boardId - Board ID
 * @returns {Promise<Array>} Array of cards
 */
export async function listCards(boardId) {
  // Verify board exists
  const board = await boardRepository.findById(boardId);
  if (!board) {
    throw new NotFoundError('Board not found');
  }

  const cards = await cardRepository.findByBoardId(boardId);
  return cards;
}

/**
 * Updates an existing card with all extended fields
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated card
 * @throws {NotFoundError} If card not found
 */
export async function updateCard(boardId, cardId, updateData) {
  // Verify card exists and belongs to board
  const existingCard = await getCardById(boardId, cardId);

  // If moving to another column, verify column exists and belongs to board
  if (updateData.columnId) {
    const column = await columnRepository.findById(updateData.columnId);
    if (!column) {
      throw new NotFoundError('Column not found');
    }
    if (column.boardId !== boardId) {
      throw new NotFoundError('Column does not belong to this board');
    }
  }

  // If setting parent card, verify it exists
  if (updateData.parentCardId) {
    const parentCard = await cardRepository.findById(updateData.parentCardId);
    if (!parentCard || parentCard.boardId !== boardId) {
      throw new NotFoundError('Parent card not found in this board');
    }
  }

  // Auto-set completedAt when status changes to 'concluido'
  if (updateData.status === 'concluido' && existingCard.status !== 'concluido') {
    updateData.completedAt = new Date().toISOString();
    updateData.progress = 100;
  }

  // Build update payload - only include defined fields
  const updatePayload = {};
  const fields = [
    'title', 'description', 'priority', 'status', 'type',
    'dueDate', 'startDate', 'completedAt',
    'estimatedHours', 'actualHours', 'progress',
    'color', 'icon', 'cover',
    'projectPhase', 'budget', 'billable', 'storyPoints', 'externalUrl',
    'customFields',
    'assignedUserId', 'reporterId', 'reviewerId', 'parentCardId',
    'columnId'
  ];

  fields.forEach(field => {
    if (updateData[field] !== undefined) {
      if (field === 'customFields' && typeof updateData[field] === 'object') {
        updatePayload[field] = JSON.stringify(updateData[field]);
      } else {
        updatePayload[field] = updateData[field];
      }
    }
  });

  const updated = await cardRepository.update(cardId, updatePayload);

  // Handle many-to-many relationships
  if (updateData.assigneeIds !== undefined) {
    await updateCardAssignees(boardId, cardId, updateData.assigneeIds);
  }

  if (updateData.watcherIds !== undefined) {
    await updateCardWatchers(boardId, cardId, updateData.watcherIds);
  }

  if (updateData.blockedByIds !== undefined) {
    await updateCardBlockers(boardId, cardId, updateData.blockedByIds);
  }

  if (updateData.relatedToIds !== undefined) {
    await updateCardRelations(boardId, cardId, updateData.relatedToIds);
  }

  logger.info({ cardId, boardId }, 'Card updated successfully');
  return getCardById(boardId, cardId);
}

/**
 * Deletes a card
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @returns {Promise<void>}
 * @throws {NotFoundError} If card not found
 */
export async function deleteCard(boardId, cardId) {
  // Verify card exists and belongs to board
  await getCardById(boardId, cardId);

  await cardRepository.delete(cardId);

  logger.info({ cardId, boardId }, 'Card deleted successfully');
}

/**
 * Moves a card to a different column and/or reorders it
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string} columnId - New column ID
 * @param {number} [order] - New order position
 * @returns {Promise<Object>} Updated card
 */
export async function moveCard(boardId, cardId, columnId, order) {
  // Verify card exists
  await getCardById(boardId, cardId);

  // Verify column exists and belongs to board
  const column = await columnRepository.findById(columnId);
  if (!column) {
    throw new NotFoundError('Column not found');
  }

  if (column.boardId !== boardId) {
    throw new NotFoundError('Column does not belong to this board');
  }

  const card = await cardRepository.moveCard(cardId, columnId, order);

  logger.info({ cardId, boardId, columnId, order }, 'Card moved successfully');
  return card;
}

// ============================================
// Many-to-Many Relationship Management
// ============================================

/**
 * Updates card assignees
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string[]} userIds - Array of user IDs
 */
export async function updateCardAssignees(boardId, cardId, userIds) {
  // Verify card exists
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }

  // Delete existing assignees and create new ones
  await prisma.$transaction([
    prisma.cardAssignee.deleteMany({ where: { cardId } }),
    prisma.cardAssignee.createMany({
      data: userIds.map(userId => ({ cardId, userId })),
      skipDuplicates: true,
    }),
  ]);

  logger.info({ cardId, userIds }, 'Card assignees updated');
}

/**
 * Updates card watchers
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string[]} userIds - Array of user IDs
 */
export async function updateCardWatchers(boardId, cardId, userIds) {
  // Verify card exists
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }

  await prisma.$transaction([
    prisma.cardWatcher.deleteMany({ where: { cardId } }),
    prisma.cardWatcher.createMany({
      data: userIds.map(userId => ({ cardId, userId })),
      skipDuplicates: true,
    }),
  ]);

  logger.info({ cardId, userIds }, 'Card watchers updated');
}

/**
 * Updates cards that block this card
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID (the blocked card)
 * @param {string[]} blockerCardIds - Array of card IDs that block this card
 */
export async function updateCardBlockers(boardId, cardId, blockerCardIds) {
  // Verify card exists
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }

  // Verify blocker cards exist and belong to same board
  for (const blockerId of blockerCardIds) {
    const blocker = await cardRepository.findById(blockerId);
    if (!blocker || blocker.boardId !== boardId) {
      throw new NotFoundError(`Blocker card ${blockerId} not found in this board`);
    }
  }

  await prisma.$transaction([
    prisma.cardBlocker.deleteMany({ where: { blockedCardId: cardId } }),
    prisma.cardBlocker.createMany({
      data: blockerCardIds.map(blockerCardId => ({
        blockedCardId: cardId,
        blockerCardId,
      })),
      skipDuplicates: true,
    }),
  ]);

  logger.info({ cardId, blockerCardIds }, 'Card blockers updated');
}

/**
 * Updates related cards
 * @param {string} boardId - Board ID
 * @param {string} cardId - Card ID
 * @param {string[]} relatedCardIds - Array of related card IDs
 */
export async function updateCardRelations(boardId, cardId, relatedCardIds) {
  // Verify card exists
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }

  // Verify related cards exist and belong to same board
  for (const relatedId of relatedCardIds) {
    const related = await cardRepository.findById(relatedId);
    if (!related || related.boardId !== boardId) {
      throw new NotFoundError(`Related card ${relatedId} not found in this board`);
    }
  }

  await prisma.$transaction([
    prisma.cardRelation.deleteMany({ where: { fromCardId: cardId } }),
    prisma.cardRelation.createMany({
      data: relatedCardIds.map(toCardId => ({
        fromCardId: cardId,
        toCardId,
      })),
      skipDuplicates: true,
    }),
  ]);

  logger.info({ cardId, relatedCardIds }, 'Card relations updated');
}

/**
 * Gets subtasks for a card
 * @param {string} boardId - Board ID
 * @param {string} cardId - Parent card ID
 * @returns {Promise<Array>} Array of subtasks
 */
export async function getSubtasks(boardId, cardId) {
  const card = await cardRepository.findById(cardId);
  if (!card || card.boardId !== boardId) {
    throw new NotFoundError('Card not found');
  }

  const subtasks = await prisma.card.findMany({
    where: { parentCardId: cardId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      title: true,
      status: true,
      progress: true,
      priority: true,
      dueDate: true,
      assignedUser: {
        select: { id: true, name: true },
      },
    },
  });

  return subtasks;
}
