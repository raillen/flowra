import { prisma } from '../config/database.js';

/**
 * Note Repository
 * Database access layer for notes
 * 
 * @module repositories/note.repository
 */

/**
 * Find all notes for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Notes
 */
export const findByUserId = async (userId, { search, projectId, limit = 50, offset = 0 } = {}) => {
    const where = { userId };

    if (projectId) {
        where.projectId = projectId;
    }

    if (search) {
        where.OR = [
            { title: { contains: search } },
            { rawContent: { contains: search } },
        ];
    }

    return prisma.note.findMany({
        where,
        include: {
            references: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
    });
};

/**
 * Find note by ID
 * @param {string} id - Note ID
 * @returns {Promise<Object|null>} Note or null
 */
export const findById = async (id) => {
    return prisma.note.findUnique({
        where: { id },
        include: {
            references: true,
            user: {
                select: { id: true, name: true, email: true },
            },
        },
    });
};

/**
 * Create a new note
 * @param {Object} data - Note data
 * @returns {Promise<Object>} Created note
 */
export const create = async (data) => {
    return prisma.note.create({
        data: {
            title: data.title,
            content: data.content,
            rawContent: data.rawContent || '',
            userId: data.userId,
            projectId: data.projectId,
        },
        include: {
            references: true,
        },
    });
};

/**
 * Update a note
 * @param {string} id - Note ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated note
 */
export const update = async (id, data) => {
    return prisma.note.update({
        where: { id },
        data: {
            title: data.title,
            content: data.content,
            rawContent: data.rawContent,
            projectId: data.projectId,
        },
        include: {
            references: true,
        },
    });
};

/**
 * Delete a note
 * @param {string} id - Note ID
 * @returns {Promise<Object>} Deleted note
 */
export const deleteNote = async (id) => {
    return prisma.note.delete({
        where: { id },
    });
};

/**
 * Add references to a note
 * @param {string} noteId - Note ID
 * @param {Array} references - Reference data
 * @returns {Promise<Array>} Created references
 */
export const addReferences = async (noteId, references) => {
    // Delete existing references first
    await prisma.noteReference.deleteMany({
        where: { noteId },
    });

    // Create new references
    if (references && references.length > 0) {
        await prisma.noteReference.createMany({
            data: references.map(ref => ({
                noteId,
                referenceType: ref.type,
                referenceId: ref.id,
                referenceTitle: ref.title,
            })),
        });
    }

    return prisma.noteReference.findMany({
        where: { noteId },
    });
};

/**
 * Search for entities to reference
 * @param {string} query - Search query
 * @param {string} userId - User ID for authorization
 * @returns {Promise<Object>} Grouped search results
 */
export const searchForReferences = async (query, userId) => {
    if (!query || query.length < 2) {
        return { projects: [], boards: [], cards: [] };
    }

    const searchTerm = query.toLowerCase();

    // Search projects
    const projects = await prisma.project.findMany({
        where: {
            userId,
            name: { contains: searchTerm },
        },
        select: { id: true, name: true },
        take: 5,
    });

    // Search boards
    const boards = await prisma.board.findMany({
        where: {
            project: { userId },
            name: { contains: searchTerm },
        },
        select: { id: true, name: true, project: { select: { name: true } } },
        take: 5,
    });

    // Search cards
    const cards = await prisma.card.findMany({
        where: {
            board: { project: { userId } },
            title: { contains: searchTerm },
        },
        select: { id: true, title: true, board: { select: { name: true } } },
        take: 5,
    });

    return { projects, boards, cards };
};
