import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Archive Scheduler Service
 * Handles automatic archiving of cards in columns with autoArchive enabled
 * 
 * @module services/archiveScheduler
 */

let intervalId = null;

/**
 * Initialize the archive scheduler
 * Runs every 15 minutes to check for cards to auto-archive
 */
export function initArchiveScheduler() {
    logger.info('Archive Scheduler initialized');

    // Run immediately on startup
    processAutoArchive();

    // Then run every 15 minutes
    intervalId = setInterval(processAutoArchive, 15 * 60 * 1000);
}

/**
 * Stop the archive scheduler
 */
export function stopArchiveScheduler() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        logger.info('Archive Scheduler stopped');
    }
}

/**
 * Process auto-archive for all columns with autoArchive enabled
 */
async function processAutoArchive() {
    try {
        logger.debug('Archive Scheduler: Checking for cards to auto-archive...');

        // Find all columns with autoArchive enabled
        const autoArchiveColumns = await prisma.column.findMany({
            where: { autoArchive: true },
            select: { id: true, title: true, boardId: true, archiveAfterMinutes: true }
        });

        if (autoArchiveColumns.length === 0) {
            logger.debug('Archive Scheduler: No auto-archive columns found');
            return;
        }

        let totalArchived = 0;

        for (const column of autoArchiveColumns) {
            const archivedCount = await archiveCardsInColumn(column);
            totalArchived += archivedCount;
        }

        if (totalArchived > 0) {
            logger.info({ totalArchived }, 'Archive Scheduler: Auto-archived cards');
        }
    } catch (error) {
        logger.error({ error }, 'Archive Scheduler: Error processing auto-archive');
    }
}

/**
 * Archive cards in a specific column based on time settings
 * @param {Object} column - Column with autoArchive settings
 * @returns {Promise<number>} Number of cards archived
 */
async function archiveCardsInColumn(column) {
    try {
        const { id: columnId, archiveAfterMinutes, boardId, title } = column;

        // Calculate the threshold time
        // If archiveAfterMinutes is null or 0, archive immediately
        // Otherwise, archive cards that have been in the column for >= X minutes
        const thresholdTime = archiveAfterMinutes && archiveAfterMinutes > 0
            ? new Date(Date.now() - archiveAfterMinutes * 60 * 1000)
            : new Date(); // Immediate = cards older than now (all cards)

        // Find cards to archive
        const cardsToArchive = await prisma.card.findMany({
            where: {
                columnId,
                archivedAt: null, // Not already archived
                updatedAt: { lte: thresholdTime } // Updated (moved to column) before threshold
            },
            select: { id: true, title: true, assignedUserId: true }
        });

        if (cardsToArchive.length === 0) {
            return 0;
        }

        // Archive the cards
        await prisma.card.updateMany({
            where: {
                id: { in: cardsToArchive.map(c => c.id) }
            },
            data: { archivedAt: new Date() }
        });

        logger.info({
            columnId,
            columnTitle: title,
            boardId,
            count: cardsToArchive.length
        }, 'Archive Scheduler: Archived cards from column');

        // TODO: Create notifications for card owners
        // for (const card of cardsToArchive) {
        //   if (card.assignedUserId) {
        //     await notificationService.create({
        //       userId: card.assignedUserId,
        //       type: 'CARD_ARCHIVED',
        //       title: 'Card arquivado automaticamente',
        //       message: `O card "${card.title}" foi arquivado automaticamente.`
        //     });
        //   }
        // }

        return cardsToArchive.length;
    } catch (error) {
        logger.error({ error, columnId: column.id }, 'Archive Scheduler: Error archiving cards in column');
        return 0;
    }
}
