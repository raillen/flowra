import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Stats routes for database statistics
 * @param {FastifyInstance} fastify
 */
export default async function statsRoutes(fastify) {
    // Get database statistics (admin only)
    fastify.get('/stats/database', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            // Check if user is admin
            if (request.user.role !== 'admin') {
                return reply.status(403).send({
                    success: false,
                    message: 'Acesso negado. Apenas administradores.'
                });
            }

            // Count all entities
            const [
                users,
                companies,
                groups,
                projects,
                boards,
                cards,
                columns,
                notes,
                attachments,
                comments,
                tags,
                collaborators,
                calendarEvents,
                notifications,
                conversations,
                messages
            ] = await Promise.all([
                prisma.user.count(),
                prisma.company.count(),
                prisma.group.count(),
                prisma.project.count(),
                prisma.board.count(),
                prisma.card.count(),
                prisma.column.count(),
                prisma.note.count(),
                prisma.attachment.count(),
                prisma.comment.count(),
                prisma.tag.count(),
                prisma.collaborator.count(),
                prisma.calendarEvent.count(),
                prisma.notification.count(),
                prisma.conversation.count(),
                prisma.message.count()
            ]);

            // Calculate storage used (attachments)
            const attachmentStats = await prisma.attachment.aggregate({
                _sum: { size: true }
            });
            const storageUsedBytes = attachmentStats._sum.size || 0;
            const storageUsedMB = (storageUsedBytes / (1024 * 1024)).toFixed(2);

            // Get database file size (SQLite)
            let dbSizeMB = 0;
            try {
                const dbPath = path.join(__dirname, '../../prisma/dev.db');
                const stats = fs.statSync(dbPath);
                dbSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            } catch (e) {
                // Ignore if can't read db file
            }

            return reply.send({
                success: true,
                data: {
                    entities: {
                        users,
                        companies,
                        groups,
                        projects,
                        boards,
                        columns,
                        cards,
                        notes,
                        attachments,
                        comments,
                        tags,
                        collaborators,
                        calendarEvents,
                        notifications,
                        conversations,
                        messages
                    },
                    storage: {
                        attachmentsMB: parseFloat(storageUsedMB),
                        databaseMB: parseFloat(dbSizeMB)
                    },
                    totals: {
                        entities: users + companies + groups + projects + boards + cards + columns + notes + attachments + comments + tags + collaborators + calendarEvents + notifications + conversations + messages
                    }
                }
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao obter estatísticas do banco de dados'
            });
        }
    });

    // Export data (admin only)
    fastify.get('/stats/export/:entity', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            if (request.user.role !== 'admin') {
                return reply.status(403).send({
                    success: false,
                    message: 'Acesso negado. Apenas administradores.'
                });
            }

            const { entity } = request.params;
            const validEntities = ['users', 'companies', 'projects', 'boards', 'cards', 'notes', 'collaborators', 'tags'];

            if (!validEntities.includes(entity)) {
                return reply.status(400).send({
                    success: false,
                    message: `Entidade inválida. Válidas: ${validEntities.join(', ')}`
                });
            }

            let data;
            switch (entity) {
                case 'users':
                    data = await prisma.user.findMany({
                        select: { id: true, name: true, email: true, role: true, createdAt: true }
                    });
                    break;
                case 'companies':
                    data = await prisma.company.findMany();
                    break;
                case 'projects':
                    data = await prisma.project.findMany({
                        include: { company: { select: { name: true } } }
                    });
                    break;
                case 'boards':
                    data = await prisma.board.findMany({
                        include: { project: { select: { name: true } } }
                    });
                    break;
                case 'cards':
                    data = await prisma.card.findMany({
                        select: { id: true, title: true, priority: true, status: true, createdAt: true, dueDate: true }
                    });
                    break;
                case 'notes':
                    data = await prisma.note.findMany({
                        select: { id: true, title: true, createdAt: true, updatedAt: true }
                    });
                    break;
                case 'collaborators':
                    data = await prisma.collaborator.findMany();
                    break;
                case 'tags':
                    data = await prisma.tag.findMany();
                    break;
            }

            return reply.send({
                success: true,
                entity,
                count: data.length,
                data
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao exportar dados'
            });
        }
    });

    // Get workload stats per user (for a project/board)
    fastify.get('/stats/workload', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            const { projectId, boardId } = request.query;

            // Build where clause
            const where = {};
            if (boardId) {
                where.boardId = boardId;
            } else if (projectId) {
                where.board = { projectId };
            }

            // Get cards grouped by assignedUserId
            const cards = await prisma.card.findMany({
                where: {
                    ...where,
                    assignedUserId: { not: null }
                },
                select: {
                    id: true,
                    status: true,
                    priority: true,
                    dueDate: true,
                    assignedUserId: true,
                    assignedUser: {
                        select: { id: true, name: true, avatar: true }
                    }
                }
            });

            // Group by user
            const userWorkload = {};
            cards.forEach(card => {
                const userId = card.assignedUserId;
                if (!userWorkload[userId]) {
                    userWorkload[userId] = {
                        user: card.assignedUser,
                        total: 0,
                        byStatus: {},
                        overdue: 0,
                        highPriority: 0
                    };
                }
                userWorkload[userId].total++;

                // Count by status
                const status = card.status || 'todo';
                userWorkload[userId].byStatus[status] = (userWorkload[userId].byStatus[status] || 0) + 1;

                // Check overdue
                if (card.dueDate && new Date(card.dueDate) < new Date()) {
                    userWorkload[userId].overdue++;
                }

                // High priority
                if (card.priority === 'alta' || card.priority === 'urgente') {
                    userWorkload[userId].highPriority++;
                }
            });

            // Convert to array and add workload level
            const workloadData = Object.values(userWorkload).map(item => {
                let level = 'low';
                if (item.total > 15 || item.overdue > 3) level = 'critical';
                else if (item.total > 10 || item.overdue > 1) level = 'high';
                else if (item.total > 5) level = 'medium';

                return {
                    ...item,
                    level
                };
            });

            // Sort by total cards descending
            workloadData.sort((a, b) => b.total - a.total);

            return reply.send({
                success: true,
                data: workloadData
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao obter carga de trabalho'
            });
        }
    });
}

