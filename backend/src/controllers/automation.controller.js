import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

export async function getRules(req, reply) {
    const { boardId } = req.params;
    try {
        const rules = await prisma.automationRule.findMany({
            where: { boardId },
            orderBy: { createdAt: 'desc' }
        });
        return rules;
    } catch (error) {
        logger.error({ error }, 'Failed to fetch automation rules');
        return reply.status(500).send({ message: 'Failed to fetch rules' });
    }
}

export async function createRule(req, reply) {
    const { boardId } = req.params;
    const { name, triggerType, conditions, actions, cronExpression } = req.body;

    try {
        const rule = await prisma.automationRule.create({
            data: {
                boardId,
                name,
                triggerType,
                conditions: typeof conditions === 'string' ? conditions : JSON.stringify(conditions),
                actions: typeof actions === 'string' ? actions : JSON.stringify(actions),
                cronExpression,
                isActive: true
            }
        });

        logger.info({ ruleId: rule.id, boardId }, 'Automation rule created');
        return rule;
    } catch (error) {
        logger.error({ error }, 'Failed to create automation rule');
        return reply.status(500).send({ message: 'Failed to create rule' });
    }
}

export async function deleteRule(req, reply) {
    const { ruleId } = req.params;
    try {
        await prisma.automationRule.delete({
            where: { id: ruleId }
        });
        return reply.code(204).send();
    } catch (error) {
        logger.error({ error }, 'Failed to delete automation rule');
        return reply.status(500).send({ message: 'Failed to delete rule' });
    }
}
