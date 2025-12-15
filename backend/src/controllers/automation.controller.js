import * as automationService from '../services/automation.service.js';
import { successResponse } from '../utils/responses.js';

/**
 * Automation Controller
 * Handles HTTP requests for automation rules
 */

export const createRule = async (request, reply) => {
    const { boardId } = request.params;
    const rule = await automationService.createRule(boardId, request.body);
    return reply.code(201).send(successResponse(rule, 'Automation rule created', 201));
};

export const listRules = async (request, reply) => {
    const { boardId } = request.params;
    const rules = await automationService.getRulesByBoard(boardId);
    return reply.send(successResponse(rules));
};

export const getRule = async (request, reply) => {
    const { ruleId } = request.params;
    const rule = await automationService.getRuleById(ruleId);
    return reply.send(successResponse(rule));
};

export const updateRule = async (request, reply) => {
    const { ruleId } = request.params;
    const rule = await automationService.updateRule(ruleId, request.body);
    return reply.send(successResponse(rule, 'Automation rule updated'));
};

export const deleteRule = async (request, reply) => {
    const { ruleId } = request.params;
    await automationService.deleteRule(ruleId);
    return reply.code(204).send();
};
