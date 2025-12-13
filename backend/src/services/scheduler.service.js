import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import * as automationService from './automation.service.js';
import { logger } from '../config/logger.js';

const prisma = new PrismaClient();

/**
 * Initialize the scheduler
 * Starts cron jobs for time-based automation
 */
export function initScheduler() {
    logger.info('Scheduler Service initialized');

    // Run every minute to check for fast-cycle rules (or every hour "0 * * * *" for prod)
    // For testing/demo, running more frequently is better
    cron.schedule('* * * * *', async () => {
        logger.debug('Scheduler: Checking for time-based rules...');
        await processTimeBasedRules();
    });
}

/**
 * Process all active time-based rules
 */
async function processTimeBasedRules() {
    try {
        // Fetch all active rules that have a cron expression
        const timeRules = await prisma.automationRule.findMany({
            where: {
                isActive: true,
                cronExpression: { not: null } // Only time-based rules
            }
        });

        if (timeRules.length === 0) return;

        logger.info(`Scheduler: Found ${timeRules.length} time-based rules.`);

        for (const rule of timeRules) {
            await executeTimeRule(rule);
        }
    } catch (error) {
        logger.error({ err: error }, 'Scheduler: Error processing time-based rules');
    }
}

/**
 * Execute a single time-based rule
 * Fetches matching cards and applies actions
 */
async function executeTimeRule(rule) {
    try {
        // 1. Check if it's time to run based on cronExpression vs lastRunAt
        // For simplicity in this iteration, we trust the minute-cron to trigger "checks", 
        // but real cron logic needs parsing.
        // HOWEVER: The "cronExpression" in the DB might define *frequency* (e.g. "Every Day") 
        // or the *condition* might define the target (e.g. "Overdue > 1 day").

        // Strategy: We run this check every minute.
        // We evaluate the conditions against candidates.

        // Parse conditions
        const conditions = rule.conditions ? JSON.parse(rule.conditions) : {};

        // 2. Find Candidate Cards
        // We verify which cards match the condition (e.g. Column=Done, UpdatedAt < 7 days ago)
        const whereClause = { boardId: rule.boardId };

        if (conditions.columnId) {
            whereClause.columnId = conditions.columnId;
        }

        // Handle "Time" conditions (e.g. overdue, stale)
        // This is complex dynamic query building.
        // Example condition: { "field": "updatedAt", "operator": "lt", "days": 30 }
        if (conditions.timeField && conditions.days) {
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - parseInt(conditions.days));

            if (conditions.operator === 'lt' || conditions.operator === 'olderThan') {
                whereClause[conditions.timeField] = { lt: dateThreshold };
            }
        }

        // Fetch matching cards
        const matchingCards = await prisma.card.findMany({
            where: whereClause
        });

        if (matchingCards.length === 0) return;

        logger.info(`Scheduler: Rule "${rule.name}" matched ${matchingCards.length} cards.`);

        // 3. Execute Actions on each card
        for (const card of matchingCards) {
            // Context for automation service needs card data
            const context = {
                cardId: card.id,
                boardId: card.boardId,
                columnId: card.columnId,
                ...card
            };

            await automationService.executeActonsDirectly(rule.actions, context);
        }

        // 4. Update last run time
        await prisma.automationRule.update({
            where: { id: rule.id },
            data: { lastRunAt: new Date() }
        });

    } catch (error) {
        logger.error({ err: error, ruleId: rule.id }, 'Scheduler: Failed to execute rule');
    }
}
