import { prisma } from '../config/database.js';

/**
 * Transfer Repository
 * Database operations for transfers
 * 
 * @module repositories/transfer.repository
 */

/**
 * Log a transfer operation
 */
export const logTransfer = async (data) => {
    return prisma.transferLog.create({
        data: {
            type: data.type,
            entityType: data.entityType,
            entityId: data.entityId,
            entityTitle: data.entityTitle,
            fromType: data.fromType,
            fromId: data.fromId,
            fromTitle: data.fromTitle,
            toType: data.toType,
            toId: data.toId,
            toTitle: data.toTitle,
            userId: data.userId,
        },
    });
};

/**
 * Get transfer history for user
 */
export const getTransferHistory = async (userId, { limit = 50, offset = 0 } = {}) => {
    return prisma.transferLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
    });
};

/**
 * Get transfer history for entity
 */
export const getEntityHistory = async (entityType, entityId) => {
    return prisma.transferLog.findMany({
        where: { entityType, entityId },
        orderBy: { createdAt: 'desc' },
    });
};

/**
 * Transfer project ownership
 */
export const transferProjectOwnership = async (projectId, newOwnerId) => {
    return prisma.project.update({
        where: { id: projectId },
        data: { userId: newOwnerId },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });
};

/**
 * Move board to another project
 */
export const moveBoard = async (boardId, targetProjectId) => {
    return prisma.board.update({
        where: { id: boardId },
        data: { projectId: targetProjectId },
        include: {
            project: { select: { id: true, name: true } },
        },
    });
};

/**
 * Move card to another board
 */
export const moveCard = async (cardId, targetBoardId, targetColumnId) => {
    // Get last position in target column
    const lastCard = await prisma.card.findFirst({
        where: { columnId: targetColumnId },
        orderBy: { position: 'desc' },
        select: { position: true },
    });

    const newPosition = (lastCard?.position ?? -1) + 1;

    return prisma.card.update({
        where: { id: cardId },
        data: {
            boardId: targetBoardId,
            columnId: targetColumnId,
            position: newPosition,
        },
        include: {
            board: { select: { id: true, name: true, project: { select: { name: true } } } },
            column: { select: { name: true } },
        },
    });
};

/**
 * Clone card to another board
 */
export const cloneCard = async (cardId, targetBoardId, targetColumnId, userId) => {
    // Get original card
    const original = await prisma.card.findUnique({
        where: { id: cardId },
        include: {
            tags: { include: { tag: true } },
        },
    });

    if (!original) return null;

    // Get last position
    const lastCard = await prisma.card.findFirst({
        where: { columnId: targetColumnId },
        orderBy: { position: 'desc' },
        select: { position: true },
    });

    // Create clone
    const clone = await prisma.card.create({
        data: {
            title: `${original.title} (cópia)`,
            description: original.description,
            status: 'todo',
            priority: original.priority,
            boardId: targetBoardId,
            columnId: targetColumnId,
            position: (lastCard?.position ?? -1) + 1,
            reporterId: userId,
        },
        include: {
            board: { select: { id: true, name: true, project: { select: { name: true } } } },
            column: { select: { name: true } },
        },
    });

    return clone;
};

/**
 * Get project by ID with user
 */
export const getProject = async (id) => {
    return prisma.project.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });
};

/**
 * Get board by ID with project
 */
export const getBoard = async (id) => {
    return prisma.board.findUnique({
        where: { id },
        include: {
            project: { select: { id: true, name: true, userId: true } },
            columns: { select: { id: true, title: true }, orderBy: { order: 'asc' } },
        },
    });
};

/**
 * Get card by ID with board
 */
export const getCard = async (id) => {
    return prisma.card.findUnique({
        where: { id },
        include: {
            board: {
                select: {
                    id: true,
                    name: true,
                    project: { select: { id: true, name: true, userId: true } }
                }
            },
            column: { select: { name: true } },
        },
    });
};

/**
 * Get user by ID
 */
export const getUser = async (id) => {
    return prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true },
    });
};

/**
 * Check if user has access to project (currently owner only)
 */
export const userHasProjectAccess = async (userId, projectId) => {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            userId: userId,
        },
    });
    return !!project;
};

/**
 * Check if user owns project
 */
export const userOwnsProject = async (userId, projectId) => {
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId: userId },
    });
    return !!project;
};

/**
 * Get available targets for transfer
 */
export const getTransferTargets = async (userId, entityType) => {
    if (entityType === 'project') {
        const users = await prisma.user.findMany({
            where: { id: { not: userId } },
            select: { id: true, name: true, email: true },
            take: 50,
        });
        return { users };
    }

    if (entityType === 'board') {
        // Get projects the user owns
        const projects = await prisma.project.findMany({
            where: { userId },
            select: { id: true, name: true },
        });
        return { projects };
    }

    if (entityType === 'card') {
        // Get boards from projects user owns
        const boards = await prisma.board.findMany({
            where: {
                project: { userId },
            },
            select: {
                id: true,
                name: true,
                project: { select: { name: true } },
                columns: { select: { id: true, title: true }, orderBy: { order: 'asc' } },
            },
        });
        return { boards };
    }

    return {};
};
