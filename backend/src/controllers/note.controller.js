import * as noteService from '../services/note.service.js';

/**
 * Note Controller
 * HTTP request handlers for notes
 * 
 * @module controllers/note.controller
 */

/**
 * Get all notes for the authenticated user
 */
export const getNotes = async (request, reply) => {
    const notes = await noteService.getNotes(request.user.id, {
        search: request.query.search,
        projectId: request.query.projectId,
        limit: parseInt(request.query.limit) || 50,
        offset: parseInt(request.query.offset) || 0,
    });

    return reply.send({
        success: true,
        data: notes,
    });
};

/**
 * Get a single note by ID
 */
export const getNoteById = async (request, reply) => {
    const note = await noteService.getNoteById(request.params.id, request.user.id);

    return reply.send({
        success: true,
        data: note,
    });
};

/**
 * Create a new note
 */
export const createNote = async (request, reply) => {
    const note = await noteService.createNote(request.body, request.user.id);

    return reply.status(201).send({
        success: true,
        data: note,
        message: 'Note created successfully',
    });
};

/**
 * Update a note
 */
export const updateNote = async (request, reply) => {
    const note = await noteService.updateNote(
        request.params.id,
        request.body,
        request.user.id
    );

    return reply.send({
        success: true,
        data: note,
        message: 'Note updated successfully',
    });
};

/**
 * Delete a note
 */
export const deleteNote = async (request, reply) => {
    await noteService.deleteNote(request.params.id, request.user.id);

    return reply.send({
        success: true,
        message: 'Note deleted successfully',
    });
};

/**
 * Search for entities to reference
 */
export const searchReferences = async (request, reply) => {
    const results = await noteService.searchReferences(
        request.query.q,
        request.user.id
    );

    return reply.send({
        success: true,
        data: results,
    });
};

/**
 * Share a note
 */
export const shareNote = async (request, reply) => {
    const { userId, permission } = request.body;
    const share = await noteService.shareNote(
        request.params.id,
        userId,
        permission,
        request.user.id
    );

    return reply.send({
        success: true,
        data: share,
        message: 'Note shared successfully',
    });
};

/**
 * Unshare a note
 */
export const unshareNote = async (request, reply) => {
    await noteService.unshareNote(
        request.params.id,
        request.params.userId,
        request.user.id
    );

    return reply.send({
        success: true,
        message: 'Note unshared successfully',
    });
};
