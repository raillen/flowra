import * as transferService from '../services/transfer.service.js';

/**
 * Transfer Controller
 * HTTP handlers for transfers
 * 
 * @module controllers/transfer.controller
 */

/**
 * Transfer project ownership
 */
export const transferProjectOwnership = async (request, reply) => {
    const result = await transferService.transferProjectOwnership(
        request.params.id,
        request.body.newOwnerId,
        request.user.id
    );

    return reply.send({
        success: true,
        data: result,
        message: 'Project ownership transferred successfully',
    });
};

/**
 * Move board to another project
 */
export const moveBoard = async (request, reply) => {
    const result = await transferService.moveBoard(
        request.params.id,
        request.body.targetProjectId,
        request.user.id
    );

    return reply.send({
        success: true,
        data: result,
        message: 'Board moved successfully',
    });
};

/**
 * Move card to another board
 */
export const moveCard = async (request, reply) => {
    const result = await transferService.moveCard(
        request.params.id,
        request.body.targetBoardId,
        request.body.targetColumnId,
        request.user.id
    );

    return reply.send({
        success: true,
        data: result,
        message: 'Card moved successfully',
    });
};

/**
 * Clone card to another board
 */
export const cloneCard = async (request, reply) => {
    const result = await transferService.cloneCard(
        request.params.id,
        request.body.targetBoardId,
        request.body.targetColumnId,
        request.user.id
    );

    return reply.status(201).send({
        success: true,
        data: result,
        message: 'Card cloned successfully',
    });
};

/**
 * Get transfer history
 */
export const getTransferHistory = async (request, reply) => {
    const history = await transferService.getTransferHistory(request.user.id, {
        limit: parseInt(request.query.limit) || 50,
        offset: parseInt(request.query.offset) || 0,
    });

    return reply.send({
        success: true,
        data: history,
    });
};

/**
 * Get transfer targets
 */
export const getTransferTargets = async (request, reply) => {
    const targets = await transferService.getTransferTargets(
        request.user.id,
        request.query.entityType
    );

    return reply.send({
        success: true,
        data: targets,
    });
};
