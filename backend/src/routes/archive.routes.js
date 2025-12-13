import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();

/**
 * Archive routes for managing archived cards
 * @param {FastifyInstance} fastify
 */
export default async function archiveRoutes(fastify) {

    // Get all archived cards for user, grouped by project/board
    fastify.get('/archive/cards', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const companyId = request.user.companyId;
            const isAdmin = request.user.role === 'admin';

            // Build where clause - admins see all
            const whereClause = {
                archivedAt: { not: null },
                ...(isAdmin ? {} : {
                    OR: [
                        // 1. Direct Access (Card Owner/Assignee)
                        { assignedUserId: userId },
                        { assignees: { some: { userId } } },

                        // 2. Board/Project Context
                        {
                            board: {
                                OR: [
                                    { project: { userId } }, // Project Owner
                                    { project: { members: { some: { userId } } } }, // Project Member
                                    ...(companyId ? [{ project: { companyId } }] : []), // Company
                                    { members: { some: { userId } } } // Board Member
                                ]
                            }
                        }
                    ]
                })
            };

            // Get archived cards from user's projects/boards
            const archivedCards = await prisma.card.findMany({
                where: whereClause,
                include: {
                    board: {
                        select: {
                            id: true,
                            name: true,
                            project: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    },
                    assignedUser: {
                        select: { id: true, name: true, avatar: true }
                    },
                    tags: {
                        include: { tag: true }
                    },
                    attachments: {
                        select: {
                            id: true,
                            filename: true,
                            originalName: true,
                            url: true,
                            mimeType: true,
                            size: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: { archivedAt: 'desc' }
            });

            // Group by project, then by board
            const grouped = {};
            archivedCards.forEach(card => {
                const projectId = card.board.project.id;
                const projectName = card.board.project.name;
                const boardId = card.board.id;
                const boardName = card.board.name;

                if (!grouped[projectId]) {
                    grouped[projectId] = {
                        id: projectId,
                        name: projectName,
                        boards: {}
                    };
                }

                if (!grouped[projectId].boards[boardId]) {
                    grouped[projectId].boards[boardId] = {
                        id: boardId,
                        name: boardName,
                        cards: []
                    };
                }

                grouped[projectId].boards[boardId].cards.push({
                    id: card.id,
                    title: card.title,
                    description: card.description,
                    priority: card.priority,
                    status: card.status,
                    archivedAt: card.archivedAt,
                    completedAt: card.completedAt,
                    dueDate: card.dueDate,
                    assignedUser: card.assignedUser,
                    tags: card.tags.map(t => t.tag),
                    attachments: card.attachments || []
                });
            });

            // Convert to array
            const result = Object.values(grouped).map(project => ({
                ...project,
                boards: Object.values(project.boards)
            }));

            return reply.send({
                success: true,
                data: result,
                totalArchived: archivedCards.length
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao buscar cards arquivados'
            });
        }
    });

    // Restore archived card to a specific column
    fastify.post('/archive/cards/:cardId/restore', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            const { cardId } = request.params;
            const { targetColumnId } = request.body || {};

            const card = await prisma.card.findUnique({
                where: { id: cardId },
                include: {
                    board: {
                        include: {
                            project: true,
                            columns: { orderBy: { order: 'asc' } }
                        }
                    }
                }
            });

            if (!card || !card.archivedAt) {
                return reply.status(404).send({
                    success: false,
                    message: 'Card arquivado não encontrado'
                });
            }

            // Determine target column: user's choice, original column, or first column
            let columnId = targetColumnId;
            if (!columnId) {
                // Try original column, fallback to first column
                const originalExists = card.board.columns.some(c => c.id === card.columnId);
                columnId = originalExists ? card.columnId : card.board.columns[0]?.id;
            }

            if (!columnId) {
                return reply.status(400).send({
                    success: false,
                    message: 'Nenhuma coluna disponível para restaurar o card'
                });
            }

            // Verify target column belongs to board
            const targetBelongsToBoard = card.board.columns.some(c => c.id === columnId);
            if (!targetBelongsToBoard) {
                return reply.status(400).send({
                    success: false,
                    message: 'Coluna de destino não pertence ao board do card'
                });
            }

            const restored = await prisma.card.update({
                where: { id: cardId },
                data: {
                    archivedAt: null,
                    columnId: columnId
                }
            });

            return reply.send({
                success: true,
                data: restored,
                message: 'Card restaurado com sucesso'
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao restaurar card'
            });
        }
    });

    // Permanently delete archived card
    fastify.delete('/archive/cards/:cardId', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            const { cardId } = request.params;

            const card = await prisma.card.findUnique({
                where: { id: cardId },
                include: { board: { include: { project: true } } }
            });

            if (!card) {
                return reply.status(404).send({
                    success: false,
                    message: 'Card não encontrado'
                });
            }

            // Only allow deletion of archived cards
            if (!card.archivedAt) {
                return reply.status(400).send({
                    success: false,
                    message: 'Apenas cards arquivados podem ser deletados permanentemente'
                });
            }

            // Verify access
            const hasAccess = card.board.project.userId === request.user.id ||
                card.board.project.companyId === request.user.companyId;

            if (!hasAccess) {
                return reply.status(403).send({
                    success: false,
                    message: 'Sem permissão para deletar este card'
                });
            }

            await prisma.card.delete({
                where: { id: cardId }
            });

            return reply.send({
                success: true,
                message: 'Card deletado permanentemente'
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao deletar card'
            });
        }
    });

    // Archive a card manually
    fastify.post('/archive/cards/:cardId/archive', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            const { cardId } = request.params;

            const card = await prisma.card.findUnique({
                where: { id: cardId },
                include: { board: { include: { project: true } } }
            });

            if (!card) {
                return reply.status(404).send({
                    success: false,
                    message: 'Card não encontrado'
                });
            }

            if (card.archivedAt) {
                return reply.status(400).send({
                    success: false,
                    message: 'Card já está arquivado'
                });
            }

            const archived = await prisma.card.update({
                where: { id: cardId },
                data: { archivedAt: new Date() }
            });

            return reply.send({
                success: true,
                data: archived,
                message: 'Card arquivado com sucesso'
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao arquivar card'
            });
        }
    });

    // Bulk delete archived cards
    fastify.delete('/archive/cards/bulk', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            const { cardIds } = request.body;

            if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
                return reply.status(400).send({
                    success: false,
                    message: 'cardIds deve ser um array não vazio'
                });
            }

            // Delete only archived cards
            const result = await prisma.card.deleteMany({
                where: {
                    id: { in: cardIds },
                    archivedAt: { not: null }
                }
            });

            return reply.send({
                success: true,
                deletedCount: result.count,
                message: `${result.count} cards deletados permanentemente`
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao deletar cards em massa'
            });
        }
    });
}
