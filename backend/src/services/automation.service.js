import { prisma } from '../config/database.js';
import * as cardRepository from '../repositories/card.repository.js';
import * as cardService from './card.service.js';
// Add other repositories as needed for actions

/**
 * Handle an event that might trigger automation rules
 * @param {string} boardId - The board ID
 * @param {string} triggerType - The event type (e.g., 'CARD_MOVE')
 * @param {Object} context - Data relevant to the event (e.g., { cardId, columnId, ... })
 */
export async function handleEvent(boardId, triggerType, context) {
    try {
        console.log(`>>> Automation handleEvent called: boardId=${boardId}, triggerType=${triggerType}, context=`, context);

        // Fetch active rules for this board and trigger
        const rules = await prisma.automationRule.findMany({
            where: {
                boardId,
                triggerType,
                isActive: true
            }
        });

        console.log(`>>> Automation: Query returned ${rules.length} rules`);
        if (rules.length === 0) {
            console.log('>>> Automation: No rules found for this trigger, exiting.');
            return;
        }

        console.log(`Automation: Found ${rules.length} rules for ${triggerType} on board ${boardId}`);

        for (const rule of rules) {
            if (evaluateCondition(rule.conditions, context)) {
                console.log(`Automation: Executing rule "${rule.name}"`);
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
        console.log('>>> evaluateCondition called:', { conditionsStr, context });
        if (!conditionsStr) {
            console.log('>>> evaluateCondition: No conditions, returning true');
            return true;
        }
        const conditions = JSON.parse(conditionsStr);
        console.log('>>> evaluateCondition: Parsed conditions:', conditions);

        // Simple AND logic: All conditions must match context values
        for (const [key, value] of Object.entries(conditions)) {
            console.log(`>>> evaluateCondition: Checking key=${key}, expected=${value}, actual=${context[key]}`);
            if (context[key] !== value) {
                console.log(`>>> evaluateCondition: MISMATCH on key=${key}`);
                return false;
            }
        }
        console.log('>>> evaluateCondition: All conditions matched, returning true');
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
                        console.log('Automation: Action ARCHIVE_CARD triggered for', context.cardId);
                        await cardRepository.update(context.cardId, { archivedAt: new Date().toISOString() });
                    }
                    break;

                case 'MOVE_CARD':
                    if (context.cardId && action.value) { // value = columnId
                        console.log('Automation: Action MOVE_CARD triggered', action.value);
                        await cardRepository.update(context.cardId, { columnId: action.value });
                    }
                    break;

                case 'ASSIGN_USER':
                    if (context.cardId && action.value) { // value = userId
                        console.log('Automation: Action ASSIGN_USER triggered', action.value);
                        await cardService.updateCardAssignees(context.boardId, context.cardId, [action.value]);
                        // Note: this replaces or adds? updateCardAssignees usually replaces. 
                        // To ADD, we would need to fetch existing.
                        // For now assuming replace or single assign logic as per MVP.
                    }
                    break;

                case 'ADD_TAG':
                    if (context.cardId && action.value) { // value = tagId
                        console.log('Automation: Action ADD_TAG triggered', action.value);
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
