import * as boardFieldConfigService from '../services/board-field-config.service.js';
import { successResponse } from '../utils/responses.js';

/**
 * Board Field Config controller
 * Handles HTTP requests for board field configuration endpoints
 * 
 * @module controllers/boardFieldConfig
 */

/**
 * Gets the field configuration for a board
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with field configuration
 */
export async function getFieldConfig(request, reply) {
    const { boardId } = request.params;

    const config = await boardFieldConfigService.getFieldConfig(boardId);

    return reply.send(successResponse(config));
}

/**
 * Updates the field configuration for a board
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with updated configuration
 */
export async function updateFieldConfig(request, reply) {
    const { boardId } = request.params;
    const { fields } = request.body;

    const config = await boardFieldConfigService.updateFieldConfig(boardId, fields);

    return reply.send(successResponse(config, 'Field configuration updated successfully'));
}

/**
 * Gets the list of enabled fields for a board
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<FastifyReply>} Response with enabled field names
 */
export async function getEnabledFields(request, reply) {
    const { boardId } = request.params;

    const enabledFields = await boardFieldConfigService.getEnabledFields(boardId);

    return reply.send(successResponse({ enabledFields }));
}
