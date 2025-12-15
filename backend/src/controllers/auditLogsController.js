import { prisma } from '../config/database.js';

export const auditLogsController = {
    async getLogs(request, reply) {
        const { page = 1, limit = 50, action, entityType, userId } = request.query;
        const skip = (page - 1) * limit;

        const where = {};

        // Security: Restrict access
        // If user is not admin, they can ONLY see their own logs
        if (request.user.role !== 'admin' && request.user.role !== 'superuser') {
            // If they tried to query another user, deny it or override
            if (userId && userId !== request.user.id) {
                return reply.status(403).send({ message: 'Forbidden: You can only view your own logs' });
            }
            where.userId = request.user.id;
        } else {
            // Admin can filter by userId if provided
            if (userId) where.userId = userId;
        }

        if (action) where.action = action;
        if (entityType) where.entityType = entityType;

        try {
            const [logs, total] = await Promise.all([
                prisma.auditLog.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip: parseInt(skip),
                    take: parseInt(limit),
                    include: {
                        // We might want to join user details if not fully stored in log, 
                        // but AuditLog model has 'userName' snapshots which is good.
                        // However, let's see if we can relate to current user for avatar if needed.
                        // Model has no relation defined in schema for `user` in easy way? 
                        // Wait, schema says: `user User @relation(...)`? Let me check schema again mentally.
                        // Yes: `userId String` and optional `user User`.
                    }
                }),
                prisma.auditLog.count({ where })
            ]);

            // Need to manually fetch user names if they are missing or to get fresh avatars?
            // For now, let's trust the log or just return raw.

            // Actually, let's include user info if relation exists.
            // Schema analysis showed: `userId String` and index, but did it have `@relation`?
            // Yes: `  user User @relation(fields: [userId], references: [id], onDelete: Cascade)` (Line 739 approx in view)
            // Wait, I need to be sure. Let's look at schema content again in memory or assume standard structure.
            // In the file view earlier: `user User @relation(fields: [userId], references: [id], ...)` WAS present in AuditLog model?
            // Let's check the schema file content from previous turn.
            // Line 725: `userId String`
            // Line 730: `createdAt DateTime`
            // No `@relation` to User defined in the provided schema view for AuditLog!
            // Line 711 `model AuditLog`. It has `userId` but no `user` relation field defined in the view I saw?
            // Wait, let's check line 737. It just ends.
            // Ah, I might have missed it or it wasn't there.
            // If it's not there, I rely on `userName` snapshot or fetch manually.
            // Let's assume standard fetch for now.

            return reply.send({
                data: logs,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Erro ao buscar logs de auditoria' });
        }
    }
};
