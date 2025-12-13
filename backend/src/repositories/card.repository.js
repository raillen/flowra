import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Card repository layer
 * Handles all database operations for cards
 * 
 * @module repositories/card
 */

/**
 * Creates a new card
 * @param {Object} data - Card data
 * @returns {Promise<Object>} Created card
 */
export async function create(data) {
  try {
    // Get the maximum order value in the column to append new card at the end
    const maxOrderResult = await prisma.card.aggregate({
      where: { columnId: data.columnId },
      _max: { order: true },
    });
    const nextOrder = (maxOrderResult._max.order ?? -1) + 1;

    const card = await prisma.card.create({
      data: {
        title: data.title,
        description: data.description || null,
        priority: data.priority || 'media',
        status: data.status || 'novo',
        type: data.type || 'tarefa',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        estimatedHours: data.estimatedHours || null,
        actualHours: data.actualHours || null,
        progress: data.progress || 0,
        color: data.color || null,
        icon: data.icon || null,
        cover: data.cover || null,
        projectPhase: data.projectPhase || null,
        budget: data.budget || null,
        billable: data.billable || false,
        storyPoints: data.storyPoints || null,
        externalUrl: data.externalUrl || null,
        customFields: data.customFields ? JSON.stringify(data.customFields) : null,
        order: nextOrder,
        assignedUserId: data.assignedUserId || null,
        reporterId: data.reporterId || null,
        reviewerId: data.reviewerId || null,
        parentCardId: data.parentCardId || null,
        columnId: data.columnId,
        boardId: data.boardId,
      },
    });

    return card;
  } catch (error) {
    logger.error({ error, data }, 'Failed to create card');
    throw error;
  }
}

/**
 * Finds a card by ID
 * @param {string} id - Card ID
 * @returns {Promise<Object|null>} Card or null if not found
 */
export async function findById(id) {
  try {
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
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

    return card;
  } catch (error) {
    logger.error({ error, id }, 'Failed to find card');
    throw error;
  }
}

/**
 * Finds all cards for a board
 * @param {string} boardId - Board ID
 * @returns {Promise<Array>} Array of cards
 */
export async function findByBoardId(boardId) {
  try {
    const cards = await prisma.card.findMany({
      where: { boardId, archivedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    return cards;
  } catch (error) {
    logger.error({ error, boardId }, 'Failed to find cards by board');
    throw error;
  }
}

/**
 * Finds all cards for a column
 * @param {string} columnId - Column ID
 * @returns {Promise<Array>} Array of cards
 */
export async function findByColumnId(columnId) {
  try {
    const cards = await prisma.card.findMany({
      where: { columnId },
      orderBy: { order: 'asc' },
    });

    return cards;
  } catch (error) {
    logger.error({ error, columnId }, 'Failed to find cards by column');
    throw error;
  }
}

/**
 * Updates a card
 * @param {string} id - Card ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated card
 */
export async function update(id, data) {
  try {
    const updateData = {};

    // Basic fields
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.type !== undefined) updateData.type = data.type;

    // Date fields
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.completedAt !== undefined) {
      updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null;
    }

    // Time tracking
    if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;
    if (data.actualHours !== undefined) updateData.actualHours = data.actualHours;
    if (data.progress !== undefined) updateData.progress = data.progress;

    // Visual fields
    if (data.color !== undefined) updateData.color = data.color;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.cover !== undefined) updateData.cover = data.cover;

    // Business fields
    if (data.projectPhase !== undefined) updateData.projectPhase = data.projectPhase;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.billable !== undefined) updateData.billable = data.billable;
    if (data.storyPoints !== undefined) updateData.storyPoints = data.storyPoints;
    if (data.externalUrl !== undefined) updateData.externalUrl = data.externalUrl;

    // Custom fields (JSON)
    if (data.customFields !== undefined) {
      updateData.customFields = data.customFields ? JSON.stringify(data.customFields) : null;
    }

    // Checklist (JSON string)
    if (data.checklist !== undefined) {
      updateData.checklist = data.checklist || null;
    }

    // Relations
    if (data.assignedUserId !== undefined) updateData.assignedUserId = data.assignedUserId;
    if (data.reporterId !== undefined) updateData.reporterId = data.reporterId;
    if (data.reviewerId !== undefined) updateData.reviewerId = data.reviewerId;
    if (data.parentCardId !== undefined) updateData.parentCardId = data.parentCardId;
    if (data.columnId !== undefined) updateData.columnId = data.columnId;

    const card = await prisma.card.update({
      where: { id },
      data: updateData,
    });

    return card;
  } catch (error) {
    logger.error({ error, id, data }, 'Failed to update card');
    throw error;
  }
}

/**
 * Deletes a card
 * @param {string} id - Card ID
 * @returns {Promise<void>}
 */
export async function deleteCard(id) {
  try {
    await prisma.card.delete({
      where: { id },
    });
  } catch (error) {
    logger.error({ error, id }, 'Failed to delete card');
    throw error;
  }
}

/**
 * Moves a card to a different column and/or reorders it
 * @param {string} id - Card ID
 * @param {string} columnId - New column ID
 * @param {number} [order] - New order position
 * @returns {Promise<Object>} Updated card
 */
export async function moveCard(id, columnId, order) {
  try {
    // Get current card info
    const currentCard = await prisma.card.findUnique({ where: { id } });
    if (!currentCard) {
      throw new Error('Card not found');
    }

    const isMovingToNewColumn = currentCard.columnId !== columnId;

    // Use a transaction for atomic updates
    return await prisma.$transaction(async (tx) => {
      // If order is provided, handle reordering
      if (order !== undefined) {
        if (isMovingToNewColumn) {
          // Moving to a new column: close gap in old column
          await tx.card.updateMany({
            where: {
              columnId: currentCard.columnId,
              order: { gt: currentCard.order },
            },
            data: {
              order: { decrement: 1 },
            },
          });

          // Make space in new column
          await tx.card.updateMany({
            where: {
              columnId: columnId,
              order: { gte: order },
            },
            data: {
              order: { increment: 1 },
            },
          });
        } else {
          // Same column reordering
          if (order > currentCard.order) {
            // Moving down: shift cards in between up
            await tx.card.updateMany({
              where: {
                columnId: columnId,
                order: { gt: currentCard.order, lte: order },
              },
              data: {
                order: { decrement: 1 },
              },
            });
          } else if (order < currentCard.order) {
            // Moving up: shift cards in between down
            await tx.card.updateMany({
              where: {
                columnId: columnId,
                order: { gte: order, lt: currentCard.order },
              },
              data: {
                order: { increment: 1 },
              },
            });
          }
        }
      } else if (isMovingToNewColumn) {
        // No order provided but moving to new column: append at end
        const maxOrderResult = await tx.card.aggregate({
          where: { columnId: columnId },
          _max: { order: true },
        });
        order = (maxOrderResult._max.order ?? -1) + 1;

        // Close gap in old column
        await tx.card.updateMany({
          where: {
            columnId: currentCard.columnId,
            order: { gt: currentCard.order },
          },
          data: {
            order: { decrement: 1 },
          },
        });
      }

      // Update the card
      const card = await tx.card.update({
        where: { id },
        data: {
          columnId,
          ...(order !== undefined && { order }),
        },
      });

      return card;
    });
  } catch (error) {
    logger.error({ error, id, columnId, order }, 'Failed to move card');
    throw error;
  }
}

export const cardRepository = {
  create,
  findById,
  findByBoardId,
  findByColumnId,
  update,
  delete: deleteCard,
  moveCard,
};

