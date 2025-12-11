import { NotFoundError, ConflictError } from '../utils/errors.js';
import { collaboratorRepository } from '../repositories/collaborator.repository.js';
import { logger } from '../config/logger.js';

/**
 * Collaborator service layer
 * Contains business logic for collaborator operations
 * 
 * @module services/collaborator
 */

/**
 * Creates a new collaborator
 * @param {Object} collaboratorData - Collaborator data
 * @returns {Promise<Object>} Created collaborator
 * @throws {ConflictError} If email already exists
 */
export async function createCollaborator(collaboratorData) {
  logger.debug({ collaboratorData }, 'Creating collaborator');
  
  // Check for duplicate email
  const existing = await collaboratorRepository.findByEmail(collaboratorData.email);
  if (existing) {
    throw new ConflictError('Collaborator with this email already exists');
  }
  
  const collaborator = await collaboratorRepository.create(collaboratorData);
  
  logger.info({ collaboratorId: collaborator.id }, 'Collaborator created successfully');
  return collaborator;
}

/**
 * Retrieves a collaborator by ID
 * @param {string} collaboratorId - Collaborator ID
 * @returns {Promise<Object>} Collaborator object
 * @throws {NotFoundError} If collaborator not found
 */
export async function getCollaboratorById(collaboratorId) {
  const collaborator = await collaboratorRepository.findById(collaboratorId);
  
  if (!collaborator) {
    throw new NotFoundError('Collaborator not found');
  }
  
  return collaborator;
}

/**
 * Lists all collaborators with pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} Paginated collaborators list
 */
export async function listCollaborators(options = {}) {
  const { page = 1, limit = 10 } = options;
  
  const [collaborators, total] = await Promise.all([
    collaboratorRepository.findAll({ page, limit }),
    collaboratorRepository.count(),
  ]);
  
  return {
    items: collaborators,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Updates an existing collaborator
 * @param {string} collaboratorId - Collaborator ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated collaborator
 * @throws {NotFoundError} If collaborator not found
 * @throws {ConflictError} If new email already exists
 */
export async function updateCollaborator(collaboratorId, updateData) {
  // Verify collaborator exists
  await getCollaboratorById(collaboratorId);
  
  // If email is being updated, check for conflicts
  if (updateData.email) {
    const existing = await collaboratorRepository.findByEmail(updateData.email);
    if (existing && existing.id !== collaboratorId) {
      throw new ConflictError('Email already registered to another collaborator');
    }
  }
  
  const updated = await collaboratorRepository.update(collaboratorId, updateData);
  
  logger.info({ collaboratorId }, 'Collaborator updated successfully');
  return updated;
}

/**
 * Deletes a collaborator
 * @param {string} collaboratorId - Collaborator ID
 * @returns {Promise<void>}
 * @throws {NotFoundError} If collaborator not found
 */
export async function deleteCollaborator(collaboratorId) {
  // Verify collaborator exists
  await getCollaboratorById(collaboratorId);
  
  await collaboratorRepository.delete(collaboratorId);
  
  logger.info({ collaboratorId }, 'Collaborator deleted successfully');
}

