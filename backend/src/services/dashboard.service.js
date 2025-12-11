import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DashboardService {
    async getGlobalData(userId) {
        const now = new Date();

        // Start of Today
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        // End of Today
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        // 7 Days Ago
        const sevenDaysAgo = new Date(todayStart);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 1. Fetch User's Assigned Cards (Active)
        const allAssignedCards = await prisma.card.findMany({
            where: {
                assignedUserId: userId,
            },
            include: {
                column: {
                    select: { id: true, title: true, color: true },
                },
                board: {
                    select: {
                        id: true,
                        name: true,
                        project: {
                            select: { id: true, name: true }
                        }
                    }
                }
            },
            orderBy: [
                { dueDate: 'asc' },
                { priority: 'desc' },
            ],
        });

        const activeCards = allAssignedCards.filter(c =>
            c.status !== 'concluido' && c.status !== 'arquivado'
        ).map(c => ({
            ...c,
            project: c.board?.project
        }));

        // 2. Classify Tasks
        const overdue = [];
        const dueToday = [];
        const others = [];

        activeCards.forEach(card => {
            const dueDate = card.dueDate ? new Date(card.dueDate) : null;

            if (!dueDate) {
                others.push(card);
                return;
            }

            if (dueDate < todayStart) {
                overdue.push(card);
            } else if (dueDate >= todayStart && dueDate <= todayEnd) {
                dueToday.push(card);
            } else {
                others.push(card);
            }
        });

        // 3. Productivity Metrics (Last 7 Days)
        const completedRecently = await prisma.card.findMany({
            where: {
                assignedUserId: userId,
                status: 'concluido',
                updatedAt: {
                    gte: sevenDaysAgo,
                },
            },
            select: {
                id: true,
                updatedAt: true,
            },
        });

        // Group completed by day
        const completedByDay = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(todayStart);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            completedByDay[dateStr] = 0;
        }

        completedRecently.forEach(card => {
            const date = card.updatedAt.toISOString().split('T')[0];
            if (completedByDay[date] !== undefined) {
                completedByDay[date]++;
            }
        });

        const velocityChart = Object.entries(completedByDay)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));


        // 4. Quick Stats
        const totalActive = activeCards.length;

        // 5. Recent Activity (using Notifications for now as proxy)
        const recentActivity = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                message: true,
                createdAt: true,
                type: true
            }
        });

        // 6. Upcoming Meetings (Calendar Events)
        const upcomingEvents = await prisma.calendarEvent.findMany({
            where: {
                userId,
                startAt: { gte: todayStart }
            },
            orderBy: { startAt: 'asc' },
            take: 3
        });

        return {
            stats: {
                totalActive,
                overdueCount: overdue.length,
                dueTodayCount: dueToday.length,
                completedWeek: completedRecently.length
            },
            tasks: {
                overdue,
                dueToday,
                all: activeCards // Unified list
            },
            metrics: {
                velocity: velocityChart
            },
            recentActivity,
            upcomingEvents
        };
    }
}

export const dashboardService = new DashboardService();
