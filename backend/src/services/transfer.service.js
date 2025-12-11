import * as transferRepository from '../repositories/transfer.repository.js';
import * as notificationService from './notification.service.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';

/**
 * Transfer Service
 * Business logic for transfers
 * 
 * @module services/transfer.service
 */

/**
 * Transfer project ownership
 */
export const transferProjectOwnership = async (projectId, newOwnerId, userId) => {
    // Get project
    const project = await transferRepository.getProject(projectId);
    if (!project) throw new NotFoundError('Project not found');

    // Check if user is owner
    if (project.userId !== userId) {
        throw new ForbiddenError('Only the owner can transfer ownership');
    }

    // Check if new owner exists
    const newOwner = await transferRepository.getUser(newOwnerId);
    if (!newOwner) throw new NotFoundError('New owner not found');

    // Can't transfer to self
    if (newOwnerId === userId) {
        throw new BadRequestError('Cannot transfer to yourself');
    }

    // Transfer
    const updated = await transferRepository.transferProjectOwnership(projectId, newOwnerId);

    // Log transfer
    await transferRepository.logTransfer({
        type: 'ownership_transfer',
        entityType: 'project',
        entityId: projectId,
        entityTitle: project.name,
        fromType: 'user',
        fromId: userId,
        fromTitle: project.user.name,
        toType: 'user',
        toId: newOwnerId,
        toTitle: newOwner.name,
        userId,
    });

    // Notify new owner
    await notificationService.createNotification({
        type: 'assigned',
        title: 'Projeto Transferido',
        message: `Você agora é o proprietário do projeto "${project.name}"`,
        userId: newOwnerId,
        refType: 'project',
        refId: projectId,
        priority: 'high',
    });

    return updated;
};

/**
 * Move board to another project
 */
export const moveBoard = async (boardId, targetProjectId, userId) => {
    // Get board
    const board = await transferRepository.getBoard(boardId);
    if (!board) throw new NotFoundError('Board not found');

    // Check if user owns source project
    const ownsSource = await transferRepository.userOwnsProject(userId, board.projectId);
    if (!ownsSource) {
        throw new ForbiddenError('You must own the source project');
    }

    // Check if user has access to target project
    const hasTargetAccess = await transferRepository.userHasProjectAccess(userId, targetProjectId);
    if (!hasTargetAccess) {
        throw new ForbiddenError('You must have access to the target project');
    }

    // Get target project info
    const targetProject = await transferRepository.getProject(targetProjectId);
    if (!targetProject) throw new NotFoundError('Target project not found');

    // Can't move to same project
    if (board.projectId === targetProjectId) {
        throw new BadRequestError('Board is already in this project');
    }

    const sourceProjectName = board.project.name;

    // Move board
    const updated = await transferRepository.moveBoard(boardId, targetProjectId);

    // Log transfer
    await transferRepository.logTransfer({
        type: 'board_move',
        entityType: 'board',
        entityId: boardId,
        entityTitle: board.name,
        fromType: 'project',
        fromId: board.projectId,
        fromTitle: sourceProjectName,
        toType: 'project',
        toId: targetProjectId,
        toTitle: targetProject.name,
        userId,
    });

    return updated;
};

/**
 * Move card to another board
 */
export const moveCard = async (cardId, targetBoardId, targetColumnId, userId) => {
    // Get card
    const card = await transferRepository.getCard(cardId);
    if (!card) throw new NotFoundError('Card not found');

    // Check access to source board's project
    const hasSourceAccess = await transferRepository.userHasProjectAccess(
        userId,
        card.board.project.id
    );
    if (!hasSourceAccess) {
        throw new ForbiddenError('You must have access to the source project');
    }

    // Get target board
    const targetBoard = await transferRepository.getBoard(targetBoardId);
    if (!targetBoard) throw new NotFoundError('Target board not found');

    // Check access to target board's project
    const hasTargetAccess = await transferRepository.userHasProjectAccess(
        userId,
        targetBoard.project.id
    );
    if (!hasTargetAccess) {
        throw new ForbiddenError('You must have access to the target project');
    }

    // Validate target column
    if (!targetColumnId) {
        // Use first column
        targetColumnId = targetBoard.columns[0]?.id;
        if (!targetColumnId) {
            throw new BadRequestError('Target board has no columns');
        }
    }

    const sourceBoardName = card.board.name;
    const sourceProjectName = card.board.project.name;

    // Move card
    const updated = await transferRepository.moveCard(cardId, targetBoardId, targetColumnId);

    // Log transfer
    await transferRepository.logTransfer({
        type: 'card_move',
        entityType: 'card',
        entityId: cardId,
        entityTitle: card.title,
        fromType: 'board',
        fromId: card.board.id,
        fromTitle: `${sourceBoardName} (${sourceProjectName})`,
        toType: 'board',
        toId: targetBoardId,
        toTitle: `${targetBoard.name} (${targetBoard.project.name})`,
        userId,
    });

    return updated;
};

/**
 * Clone card to another board
 */
export const cloneCard = async (cardId, targetBoardId, targetColumnId, userId) => {
    // Get original card
    const card = await transferRepository.getCard(cardId);
    if (!card) throw new NotFoundError('Card not found');

    // Check access to target board's project
    const targetBoard = await transferRepository.getBoard(targetBoardId);
    if (!targetBoard) throw new NotFoundError('Target board not found');

    const hasTargetAccess = await transferRepository.userHasProjectAccess(
        userId,
        targetBoard.project.id
    );
    if (!hasTargetAccess) {
        throw new ForbiddenError('You must have access to the target project');
    }

    // Validate target column
    if (!targetColumnId) {
        targetColumnId = targetBoard.columns[0]?.id;
        if (!targetColumnId) {
            throw new BadRequestError('Target board has no columns');
        }
    }

    // Clone card
    const clone = await transferRepository.cloneCard(cardId, targetBoardId, targetColumnId, userId);

    // Log transfer
    await transferRepository.logTransfer({
        type: 'card_clone',
        entityType: 'card',
        entityId: clone.id,
        entityTitle: clone.title,
        fromType: 'card',
        fromId: cardId,
        fromTitle: card.title,
        toType: 'board',
        toId: targetBoardId,
        toTitle: `${targetBoard.name} (${targetBoard.project.name})`,
        userId,
    });

    return clone;
};

/**
 * Get transfer history
 */
export const getTransferHistory = async (userId, options = {}) => {
    return transferRepository.getTransferHistory(userId, options);
};

/**
 * Get available targets for transfer
 */
export const getTransferTargets = async (userId, entityType) => {
    return transferRepository.getTransferTargets(userId, entityType);
};
