import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();

/**
 * Filter routes for saved filters management
 * @param {FastifyInstance} fastify
 */
export default async function filterRoutes(fastify) {

    // Get all saved filters for current user
    fastify.get('/filters', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            const { projectId, boardId } = request.query;

            const where = {
                userId: request.user.id
            };

            // Filter by scope if provided
            if (projectId) where.projectId = projectId;
            if (boardId) where.boardId = boardId;

            const filters = await prisma.savedFilter.findMany({
                where,
                orderBy: [
                    { isDefault: 'desc' },
                    { updatedAt: 'desc' }
                ]
            });

            return reply.send({
                success: true,
                data: filters.map(f => ({
                    ...f,
                    filters: JSON.parse(f.filters)
                }))
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao buscar filtros salvos'
            });
        }
    });

    // Create a saved filter
    fastify.post('/filters', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            const { name, description, filters, projectId, boardId, isDefault } = request.body;

            if (!name || !filters) {
                return reply.status(400).send({
                    success: false,
                    message: 'Nome e filtros são obrigatórios'
                });
            }

            // If setting as default, remove default from others
            if (isDefault) {
                await prisma.savedFilter.updateMany({
                    where: {
                        userId: request.user.id,
                        projectId: projectId || null,
                        boardId: boardId || null,
                        isDefault: true
                    },
                    data: { isDefault: false }
                });
            }

            const savedFilter = await prisma.savedFilter.create({
                data: {
                    name,
                    description,
                    filters: JSON.stringify(filters),
                    userId: request.user.id,
                    projectId: projectId || null,
                    boardId: boardId || null,
                    isDefault: isDefault || false
                }
            });

            return reply.status(201).send({
                success: true,
                data: {
                    ...savedFilter,
                    filters: JSON.parse(savedFilter.filters)
                }
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao criar filtro'
            });
        }
    });

    // Update a saved filter
    fastify.put('/filters/:id', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { name, description, filters, isDefault } = request.body;

            // Check ownership
            const existing = await prisma.savedFilter.findFirst({
                where: {
                    id,
                    userId: request.user.id
                }
            });

            if (!existing) {
                return reply.status(404).send({
                    success: false,
                    message: 'Filtro não encontrado'
                });
            }

            // If setting as default, remove default from others
            if (isDefault && !existing.isDefault) {
                await prisma.savedFilter.updateMany({
                    where: {
                        userId: request.user.id,
                        projectId: existing.projectId,
                        boardId: existing.boardId,
                        isDefault: true
                    },
                    data: { isDefault: false }
                });
            }

            const updated = await prisma.savedFilter.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(filters && { filters: JSON.stringify(filters) }),
                    ...(isDefault !== undefined && { isDefault })
                }
            });

            return reply.send({
                success: true,
                data: {
                    ...updated,
                    filters: JSON.parse(updated.filters)
                }
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao atualizar filtro'
            });
        }
    });

    // Delete a saved filter
    fastify.delete('/filters/:id', {
        preHandler: [authenticate]
    }, async (request, reply) => {
        try {
            const { id } = request.params;

            // Check ownership
            const existing = await prisma.savedFilter.findFirst({
                where: {
                    id,
                    userId: request.user.id
                }
            });

            if (!existing) {
                return reply.status(404).send({
                    success: false,
                    message: 'Filtro não encontrado'
                });
            }

            await prisma.savedFilter.delete({
                where: { id }
            });

            return reply.send({
                success: true,
                message: 'Filtro removido com sucesso'
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Erro ao remover filtro'
            });
        }
    });
}
