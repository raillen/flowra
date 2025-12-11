import { NotFoundError } from '../utils/errors.js';
import { boardFieldConfigRepository } from '../repositories/board-field-config.repository.js';
import { boardRepository } from '../repositories/board.repository.js';
import { defaultFieldConfig } from '../validators/board-field-config.validator.js';
import { logger } from '../config/logger.js';

/**
 * Board Field Config service layer
 * Contains business logic for board field configurations
 * 
 * @module services/boardFieldConfig
 */

/**
 * Gets the field configuration for a board
 * Creates default config if it doesn't exist
 * 
 * @param {string} boardId - Board ID
 * @returns {Promise<Object>} Field configuration
 */
export async function getFieldConfig(boardId) {
    // Verify board exists
    const board = await boardRepository.findById(boardId);
    if (!board) {
        throw new NotFoundError('Board not found');
    }

    // Get existing config or create default
    let config = await boardFieldConfigRepository.findByBoardId(boardId);

    if (!config) {
        // Create default config for this board
        config = await boardFieldConfigRepository.create(boardId, defaultFieldConfig);
        logger.info({ boardId }, 'Created default field config for board');
    }

    return config;
}

/**
 * Updates the field configuration for a board
 * 
 * @param {string} boardId - Board ID
 * @param {Object} fields - New field configuration
 * @returns {Promise<Object>} Updated configuration
 */
export async function updateFieldConfig(boardId, fields) {
    // Verify board exists
    const board = await boardRepository.findById(boardId);
    if (!board) {
        throw new NotFoundError('Board not found');
    }

    // Merge with default config to ensure all fields exist
    const mergedFields = {
        ...defaultFieldConfig,
        ...fields,
    };

    const config = await boardFieldConfigRepository.upsert(boardId, mergedFields);

    logger.info({ boardId }, 'Updated field config for board');

    return config;
}

/**
 * Checks if a field is enabled for a board
 * 
 * @param {string} boardId - Board ID
 * @param {string} fieldName - Field name to check
 * @returns {Promise<boolean>} Whether the field is enabled
 */
export async function isFieldEnabled(boardId, fieldName) {
    const config = await getFieldConfig(boardId);
    return config.fields[fieldName]?.enabled ?? false;
}

/**
 * Gets enabled fields for a board
 * 
 * @param {string} boardId - Board ID
 * @returns {Promise<string[]>} List of enabled field names
 */
export async function getEnabledFields(boardId) {
    const config = await getFieldConfig(boardId);

    return Object.entries(config.fields)
        .filter(([, value]) => value?.enabled)
        .map(([key]) => key);
}

/**
 * Validates card data against board field requirements
 * 
 * @param {string} boardId - Board ID
 * @param {Object} cardData - Card data to validate
 * @returns {Promise<{valid: boolean, errors: string[]}>} Validation result
 */
export async function validateCardFields(boardId, cardData) {
    const config = await getFieldConfig(boardId);
    const errors = [];

    // Check required fields
    for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
        if (fieldConfig?.enabled && fieldConfig?.required) {
            if (cardData[fieldName] === null || cardData[fieldName] === undefined || cardData[fieldName] === '') {
                errors.push(`Field '${fieldName}' is required`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

export const boardFieldConfigService = {
    getFieldConfig,
    updateFieldConfig,
    isFieldEnabled,
    getEnabledFields,
    validateCardFields,
};
