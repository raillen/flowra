import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getBoardSummary = async (request, reply) => {
    const { boardId } = request.params;
    try {
        const cards = await prisma.card.findMany({
            where: { boardId, archivedAt: null },
            select: {
                id: true,
                status: true,
                dueDate: true,
                completedAt: true,
                estimatedHours: true,
                actualHours: true
            }
        });

        const totalCards = cards.length;
        const completedCards = cards.filter(c => c.status === 'concluido' || c.completedAt).length;

        const now = new Date();
        const overdueCards = cards.filter(c =>
            c.dueDate &&
            new Date(c.dueDate) < now &&
            c.status !== 'concluido' &&
            !c.completedAt
        ).length;

        const totalEstimatedHours = cards.reduce((acc, c) => acc + (c.estimatedHours || 0), 0);
        const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

        return reply.send({
            totalCards,
            completedCards,
            overdueCards,
            totalEstimatedHours,
            completionRate
        });
    } catch (error) {
        console.error('Error fetching board summary:', error);
        return reply.status(500).send({ error: 'Failed to fetch analytics' });
    }
};

export const getMemberWorkload = async (request, reply) => {
    const { boardId } = request.params;
    try {
        const members = await prisma.boardMember.findMany({
            where: { boardId },
            include: { user: true }
        });

        const cards = await prisma.card.findMany({
            where: { boardId, archivedAt: null },
            include: { assignedUser: true }
        });

        const workload = {};

        members.forEach(m => {
            workload[m.userId] = {
                name: m.user.name,
                avatar: m.user.avatar,
                tasks: 0,
                completed: 0,
                hours: 0,
                overdue: 0
            };
        });

        const now = new Date();

        cards.forEach(card => {
            const userId = card.assignedUserId;
            if (!userId) return;

            if (!workload[userId] && card.assignedUser) {
                workload[userId] = {
                    name: card.assignedUser.name,
                    avatar: card.assignedUser.avatar,
                    tasks: 0,
                    completed: 0,
                    hours: 0,
                    overdue: 0
                };
            }

            if (workload[userId]) {
                workload[userId].tasks++;
                workload[userId].hours += (card.estimatedHours || 0);

                if (card.status === 'concluido' || card.completedAt) {
                    workload[userId].completed++;
                }

                if (card.dueDate && new Date(card.dueDate) < now && card.status !== 'concluido' && !card.completedAt) {
                    workload[userId].overdue++;
                }
            }
        });

        return reply.send(Object.values(workload));
    } catch (error) {
        console.error('Error fetching workload:', error);
        return reply.status(500).send({ error: 'Failed to fetch workload' });
    }
};

export const getStatusDistribution = async (request, reply) => {
    const { boardId } = request.params;
    try {
        const columns = await prisma.column.findMany({
            where: { boardId },
            include: { _count: { select: { cards: { where: { archivedAt: null } } } } }
        });

        const distribution = columns.map(col => ({
            name: col.title,
            value: col._count.cards,
            color: col.color ? col.color.replace('bg-', '') : '#cbd5e1'
        }));

        return reply.send(distribution);
    } catch (error) {
        console.error('Error fetching status distribution:', error);
        return reply.status(500).send({ error: 'Failed to fetch distribution' });
    }
};

export const getBurndown = async (request, reply) => {
    const { boardId } = request.params;
    try {
        const today = new Date();
        const lookbackDays = 30;
        const startDate = new Date();
        startDate.setDate(today.getDate() - lookbackDays);

        const data = [];
        // Note: Real implementation needs more complex query logic.
        // For now returning mock structure but derived dynamically if possible or just simplified.
        // Returning empty array if no complex logic implemented to avoid errors.

        // Let's implement minimal viable real data
        const allCards = await prisma.card.findMany({
            where: { boardId },
            select: { createdAt: true, completedAt: true }
        });

        let currentDate = new Date(startDate);
        while (currentDate <= today) {
            const nextDay = new Date(currentDate);
            nextDay.setDate(currentDate.getDate() + 1);

            const createdCount = allCards.filter(c => new Date(c.createdAt) < nextDay).length;
            const completedCount = allCards.filter(c => c.completedAt && new Date(c.completedAt) < nextDay).length;

            const remaining = Math.max(0, createdCount - completedCount);

            data.push({
                day: `${currentDate.getDate()}/${currentDate.getMonth() + 1}`,
                remaining,
                ideal: null
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (data.length > 0) {
            const startVal = data[0].remaining;
            const steps = data.length - 1;
            data.forEach((d, i) => {
                d.ideal = Math.round(startVal - (startVal / steps) * i);
            });
        }

        return reply.send(data);
    } catch (error) {
        console.error('Error fetching burndown:', error);
        return reply.status(500).send({ error: 'Failed to fetch burndown' });
    }
};
