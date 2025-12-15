import { prisma } from '../config/database.js';

export const automationRepository = {
    create: async (data) => {
        return prisma.automationRule.create({
            data,
        });
    },

    findById: async (id) => {
        return prisma.automationRule.findUnique({
            where: { id },
        });
    },

    findByBoardId: async (boardId) => {
        return prisma.automationRule.findMany({
            where: { boardId },
            orderBy: { createdAt: 'desc' },
        });
    },

    update: async (id, data) => {
        return prisma.automationRule.update({
            where: { id },
            data,
        });
    },

    delete: async (id) => {
        return prisma.automationRule.delete({
            where: { id },
        });
    },
};
