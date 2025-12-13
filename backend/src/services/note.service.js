import * as noteRepository from '../repositories/note.repository.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

/**
 * Note Service
 * Business logic for notes
 * 
 * @module services/note.service
 */

/**
 * Get all notes for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Notes
 */
export const getNotes = async (userId, options = {}) => {
    return noteRepository.findByUserId(userId, options);
};

/**
 * Get a note by ID
 * @param {string} id - Note ID
 * @param {string} userId - User ID for authorization
 * @returns {Promise<Object>} Note
 */
export const getNoteById = async (id, userId) => {
    const note = await noteRepository.findById(id);

    if (!note) {
        throw new NotFoundError('Note not found');
    }

    if (note.userId !== userId) {
        throw new ForbiddenError('Access denied');
    }

    return note;
};

/**
 * Create a new note
 * @param {Object} data - Note data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created note
 */
export const createNote = async (data, userId) => {
    const note = await noteRepository.create({
        title: data.title || 'Sem título',
        content: data.content || '',
        rawContent: data.rawContent || stripHtml(data.content || ''),
        userId,
        projectId: data.projectId,
    });

    // Add references if provided
    if (data.references && data.references.length > 0) {
        await noteRepository.addReferences(note.id, data.references);
    }

    return noteRepository.findById(note.id);
};

/**
 * Update a note
 * @param {string} id - Note ID
 * @param {Object} data - Update data
 * @param {string} userId - User ID for authorization
 * @returns {Promise<Object>} Updated note
 */
export const updateNote = async (id, data, userId) => {
    const note = await noteRepository.findById(id);

    if (!note) {
        throw new NotFoundError('Note not found');
    }

    if (note.userId !== userId) {
        throw new ForbiddenError('Access denied');
    }

    const updatedNote = await noteRepository.update(id, {
        title: data.title,
        content: data.content,
        rawContent: data.rawContent || stripHtml(data.content || ''),
        projectId: data.projectId,
    });

    // Update references
    if (data.references !== undefined) {
        await noteRepository.addReferences(id, data.references);
    }

    return noteRepository.findById(id);
};

/**
 * Delete a note
 * @param {string} id - Note ID
 * @param {string} userId - User ID for authorization
 * @returns {Promise<Object>} Deleted note
 */
export const deleteNote = async (id, userId) => {
    const note = await noteRepository.findById(id);

    if (!note) {
        throw new NotFoundError('Note not found');
    }

    if (note.userId !== userId) {
        throw new ForbiddenError('Access denied');
    }

    return noteRepository.deleteNote(id);
};

/**
 * Search for entities to reference
 * @param {string} query - Search query
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Search results
 */
export const searchReferences = async (query, userId) => {
    return noteRepository.searchForReferences(query, userId);
};

/**
 * Share a note with a user
 * @param {string} id - Note ID
 * @param {string} targetUserId - User ID to share with
 * @param {string} permission - Permission level (viewer/editor)
 * @param {string} ownerId - Current user ID (owner)
 * @returns {Promise<Object>} Updated note share
 */
export const shareNote = async (id, targetUserId, permission, ownerId) => {
    const note = await noteRepository.findById(id);

    if (!note) {
        throw new NotFoundError('Note not found');
    }

    if (note.userId !== ownerId) {
        throw new ForbiddenError('Only the owner can share the note');
    }

    if (note.userId === targetUserId) {
        throw new Error('Cannot share note with yourself');
    }

    // Check if valid permission
    if (!['viewer', 'editor'].includes(permission)) {
        throw new Error('Invalid permission');
    }

    // Add or update share
    const existingShare = note.shares?.find(s => s.userId === targetUserId);
    if (existingShare) {
        return noteRepository.updateShare(id, targetUserId, permission);
    }

    return noteRepository.addShare(id, targetUserId, permission);
};

/**
 * Remove a user from note shares
 * @param {string} id - Note ID
 * @param {string} targetUserId - User ID to remove
 * @param {string} ownerId - Current user ID (owner)
 * @returns {Promise<void>}
 */
export const unshareNote = async (id, targetUserId, ownerId) => {
    const note = await noteRepository.findById(id);

    if (!note) {
        throw new NotFoundError('Note not found');
    }

    // Allow owner to remove anyone, or user to remove themselves
    if (note.userId !== ownerId && ownerId !== targetUserId) {
        throw new ForbiddenError('Access denied');
    }

    return noteRepository.removeShare(id, targetUserId);
};

/**
 * Strip HTML tags from content
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
const stripHtml = (html) => {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};
