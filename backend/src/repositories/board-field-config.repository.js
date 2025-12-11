import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { defaultFieldConfig } from '../validators/board-field-config.validator.js';

/**
 * Board Field Config repository layer
 * Handles all database operations for board field configurations
 * 
 * @module repositories/boardFieldConfig
 */

/**
 * Creates a new board field configuration
 * @param {string} boardId - Board ID
 * @param {Object} fields - Field configuration object
 * @returns {Promise<Object>} Created config
 */
export async function create(boardId, fields = defaultFieldConfig) {
    try {
        const config = await prisma.boardFieldConfig.create({
            data: {
                boardId,
                fields: JSON.stringify(fields),
            },
        });

        return {
            ...config,
            fields: JSON.parse(config.fields),
        };
    } catch (error) {
        logger.error({ error, boardId }, 'Failed to create board field config');
        throw error;
    }
}

/**
 * Finds a board field configuration by board ID
 * @param {string} boardId - Board ID
 * @returns {Promise<Object|null>} Config or null if not found
 */
export async function findByBoardId(boardId) {
    const config = await prisma.boardFieldConfig.findUnique({
        where: { boardId },
    });

    if (!config) {
        return null;
    }

    return {
        ...config,
        fields: JSON.parse(config.fields),
    };
}

/**
 * Updates or creates a board field configuration
 * @param {string} boardId - Board ID
 * @param {Object} fields - Field configuration object
 * @returns {Promise<Object>} Updated config
 */
export async function upsert(boardId, fields) {
    try {
        const config = await prisma.boardFieldConfig.upsert({
            where: { boardId },
            create: {
                boardId,
                fields: JSON.stringify(fields),
            },
            update: {
                fields: JSON.stringify(fields),
            },
        });

        return {
            ...config,
            fields: JSON.parse(config.fields),
        };
    } catch (error) {
        logger.error({ error, boardId }, 'Failed to upsert board field config');
        throw error;
    }
}

/**
 * Deletes a board field configuration
 * @param {string} boardId - Board ID
 * @returns {Promise<Object>} Deleted config
 */
export async function deleteByBoardId(boardId) {
    return prisma.boardFieldConfig.delete({
        where: { boardId },
    });
}

export const boardFieldConfigRepository = {
    create,
    findByBoardId,
    upsert,
    deleteByBoardId,
};
