import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();

/**
 * Audit service for logging actions
 */
export const logAudit = async (data) => {
    try {
        return await prisma.auditLog.create({
            data: {
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                entityTitle: data.entityTitle,
                changes: data.changes ? JSON.stringify(data.changes) : null,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null,
                userId: data.userId,
                userName: data.userName,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent
            }
        });
    } catch (error) {
        console.error('Failed to log audit:', error);
        // Don't throw - audit logging should not break main operations
    }
};

/**
 * Audit routes for querying audit logs
 * @param {FastifyInstance} fastify
 */
export default async function auditRoutes(fastify) {

    // Get audit logs (admin only)
    fastify.get('/audit/logs', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            // Admin check
            if (request.user.role !== 'admin') {
                return reply.status(403).send({
                    success: false,
                    message: 'Acesso negado. Apenas administradores.'
                });
            }

            const {
                entityType,
                entityId,
                action,
                userId,
                startDate,
                endDate,
                limit = 50,
                offset = 0
            } = request.query;

            // Build where clause
            const where = {};
            if (entityType) where.entityType = entityType;
            if (entityId) where.entityId = entityId;
            if (action) where.action = action;
            if (userId) where.userId = userId;
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) where.createdAt.gte = new Date(startDate);
                if (endDate) where.createdAt.lte = new Date(endDate);
            }

            const [logs, total] = await Promise.all([
                prisma.auditLog.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    take: parseInt(limit),
                    skip: parseInt(offset)
                }),
                prisma.auditLog.count({ where })
            ]);

            return reply.send({
                success: true,
                data: logs.map(log => ({
                    ...log,
                    changes: log.changes ? JSON.parse(log.changes) : null,
                    metadata: log.metadata ? JSON.parse(log.metadata) : null
                })),
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: parseInt(offset) + logs.length < total
                }
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao buscar logs de auditoria'
            });
        }
    });

    // Get audit logs for specific entity
    fastify.get('/audit/entity/:entityType/:entityId', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            const { entityType, entityId } = request.params;
            const { limit = 20 } = request.query;

            const logs = await prisma.auditLog.findMany({
                where: { entityType, entityId },
                orderBy: { createdAt: 'desc' },
                take: parseInt(limit)
            });

            return reply.send({
                success: true,
                data: logs.map(log => ({
                    ...log,
                    changes: log.changes ? JSON.parse(log.changes) : null,
                    metadata: log.metadata ? JSON.parse(log.metadata) : null
                }))
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao buscar histórico da entidade'
            });
        }
    });

    // Get activity summary (dashboard)
    fastify.get('/audit/summary', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            if (request.user.role !== 'admin') {
                return reply.status(403).send({
                    success: false,
                    message: 'Acesso negado'
                });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [todayCount, weekCount, byAction, byEntityType] = await Promise.all([
                prisma.auditLog.count({
                    where: { createdAt: { gte: today } }
                }),
                prisma.auditLog.count({
                    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
                }),
                prisma.auditLog.groupBy({
                    by: ['action'],
                    _count: true,
                    where: { createdAt: { gte: today } }
                }),
                prisma.auditLog.groupBy({
                    by: ['entityType'],
                    _count: true,
                    where: { createdAt: { gte: today } }
                })
            ]);

            return reply.send({
                success: true,
                data: {
                    today: todayCount,
                    thisWeek: weekCount,
                    byAction: byAction.reduce((acc, item) => {
                        acc[item.action] = item._count;
                        return acc;
                    }, {}),
                    byEntityType: byEntityType.reduce((acc, item) => {
                        acc[item.entityType] = item._count;
                        return acc;
                    }, {})
                }
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao buscar resumo de atividades'
            });
        }
    });
}
