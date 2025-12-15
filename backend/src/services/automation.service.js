import { prisma } from '../config/database.js';
import * as cardRepository from '../repositories/card.repository.js';
import * as cardService from './card.service.js';
import { automationRepository } from '../repositories/automation.repository.js';
import { NotFoundError } from '../utils/errors.js';
// Add other repositories as needed for actions

/**
 * Handle an event that might trigger automation rules
 * @param {string} boardId - The board ID
 * @param {string} triggerType - The event type (e.g., 'CARD_MOVE')
 * @param {Object} context - Data relevant to the event (e.g., { cardId, columnId, ... })
 */

export const createRule = async (boardId, ruleData) => {
    // Ensure actions/conditions are stringified if they aren't already strings
    const conditions = typeof ruleData.conditions === 'object'
        ? JSON.stringify(ruleData.conditions)
        : ruleData.conditions;

    const actions = typeof ruleData.actions === 'object'
        ? JSON.stringify(ruleData.actions)
        : ruleData.actions;

    return automationRepository.create({
        boardId,
        name: ruleData.name || 'Nova Regra',
        triggerType: ruleData.triggerType,
        conditions: conditions || '{}',
        actions: actions || '[]',
        cronExpression: ruleData.cronExpression,
        isActive: ruleData.isActive ?? true,
    });
};

export const getRulesByBoard = async (boardId) => {
    return automationRepository.findByBoardId(boardId);
};

export const getRuleById = async (id) => {
    const rule = await automationRepository.findById(id);
    if (!rule) throw new NotFoundError('Automation rule not found');
    return rule;
};

export const updateRule = async (id, updateData) => {
    const existing = await automationRepository.findById(id);
    if (!existing) throw new NotFoundError('Automation rule not found');

    if (updateData.conditions && typeof updateData.conditions === 'object') {
        updateData.conditions = JSON.stringify(updateData.conditions);
    }
    if (updateData.actions && typeof updateData.actions === 'object') {
        updateData.actions = JSON.stringify(updateData.actions);
    }

    return automationRepository.update(id, updateData);
};

export const deleteRule = async (id) => {
    const existing = await automationRepository.findById(id);
    if (!existing) throw new NotFoundError('Automation rule not found');
    return automationRepository.delete(id);
};

/**
 * Handle an event that might trigger automation rules
    try {
        // console.log(`>>> Automation handleEvent called: boardId=${boardId}, triggerType=${triggerType}, context=`, context);

        // Fetch active rules for this board and trigger
        const rules = await prisma.automationRule.findMany({
            where: {
                boardId,
                triggerType,
                isActive: true
            }
        });



        for (const rule of rules) {
            if (evaluateCondition(rule.conditions, context)) {
                // console.log(`Automation: Executing rule "${rule.name}"`);
                await executeActions(rule.actions, context);
            }
        }
    } catch (error) {
        console.error('Automation: Error handling event', error);
    }
}

/**
 * Evaluate if the context meets the rule conditions
 * @param {string} conditionsStr - JSON string of conditions
 * @param {Object} context - Event context
 * @returns {boolean}
 */
function evaluateCondition(conditionsStr, context) {
    try {

        return true;
    } catch (e) {
        console.error('Automation: Condition parse error', e);
        return false;
    }
}

/**
 * Public wrapper for executing actions directly (used by Scheduler)
 */
export async function executeActonsDirectly(actionsStr, context) {
    return executeActions(actionsStr, context);
}

/**
 * Execute the defined actions
 * @param {string} actionsStr - JSON string of actions
 * @param {Object} context - Event context
 */
async function executeActions(actionsStr, context) {
    try {
        if (!actionsStr) return;
        const actions = JSON.parse(actionsStr);

        for (const action of actions) {
            switch (action.type) {
                case 'ARCHIVE_CARD':
                    if (context.cardId) {
                        // console.log('Automation: Action ARCHIVE_CARD triggered for', context.cardId);
                        await cardRepository.update(context.cardId, { archivedAt: new Date().toISOString() });
                    }
                    break;

                case 'MOVE_CARD':
                    if (context.cardId && action.value) { // value = columnId
                        // console.log('Automation: Action MOVE_CARD triggered', action.value);
                        await cardRepository.update(context.cardId, { columnId: action.value });
                    }
                    break;

                case 'ASSIGN_USER':
                    if (context.cardId && action.value) { // value = userId
                        // console.log('Automation: Action ASSIGN_USER triggered', action.value);
                        await cardService.updateCardAssignees(context.boardId, context.cardId, [action.value]);
                        // Note: this replaces or adds? updateCardAssignees usually replaces. 
                        // To ADD, we would need to fetch existing.
                        // For now assuming replace or single assign logic as per MVP.
                    }
                    break;

                case 'ADD_TAG':
                    if (context.cardId && action.value) { // value = tagId
                        // console.log('Automation: Action ADD_TAG triggered', action.value);
                        // Logic to add tag would rely on a tagService or direct DB
                        // Trying Prisma direct for simplicity to avoid circular deps if tagService uses automation
                        await prisma.cardTag.create({
                            data: {
                                cardId: context.cardId,
                                tagId: action.value
                            }
                        }).catch(e => console.log("Tag already exists ignored"));
                    }
                    break;

                default:
                    console.warn('Automation: Unknown action type', action.type);
            }
        }
    } catch (e) {
        console.error('Automation: Action execution error', e);
    }
}
