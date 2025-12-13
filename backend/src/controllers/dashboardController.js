import { prisma } from '../config/database.js';

export const dashboardController = {
    async getGlobalStats(request, reply) {
        const userId = request.user.id; // From authenticate middleware

        try {
            // 1. Calculate Stats (KPIs)
            // Fetch all cards assigned to user or relevant to user (e.g. user is member of project)
            // For simplicity, let's fetch cards assigned to user primarily

            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - 7);

            const activeCards = await prisma.card.count({
                where: {
                    assignedUserId: userId,
                    status: { not: 'concluido' },
                    archivedAt: null
                }
            });

            const dueTodayCount = await prisma.card.count({
                where: {
                    assignedUserId: userId,
                    dueDate: {
                        gte: startOfDay,
                        lte: endOfDay
                    },
                    status: { not: 'concluido' },
                    archivedAt: null
                }
            });

            const completedWeek = await prisma.card.count({
                where: {
                    assignedUserId: userId,
                    status: 'concluido',
                    completedAt: {
                        gte: weekStart
                    }
                }
            });

            const overdueCount = await prisma.card.count({
                where: {
                    assignedUserId: userId,
                    dueDate: {
                        lt: startOfDay
                    },
                    status: { not: 'concluido' },
                    archivedAt: null
                }
            });

            // 2. Fetch Tasks for Timeline (Upcoming)
            const allTasks = await prisma.card.findMany({
                where: {
                    assignedUserId: userId,
                    status: { not: 'concluido' },
                    archivedAt: null
                },
                orderBy: { dueDate: 'asc' },
                take: 10,
                include: {
                    // project: { select: { name: true, id: true } }, // Invalid relation
                    // board: { select: { projectId: true } }, // This might be valid if Card has boardId
                    // Let's resolve project via Board if Card has boardId
                    board: {
                        include: {
                            project: { select: { name: true, id: true } }
                        }
                    },
                    assignedUser: { select: { name: true, avatar: true } }
                }
            });

            const overdueTasks = await prisma.card.findMany({
                where: {
                    assignedUserId: userId,
                    dueDate: { lt: startOfDay },
                    status: { not: 'concluido' },
                    archivedAt: null
                },
                orderBy: { dueDate: 'asc' },
                take: 5
            });

            // 3. Metrics (Velocity / Activity) - Last 7 days completion
            const velocity = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(date.setHours(23, 59, 59, 999));

                const count = await prisma.card.count({
                    where: {
                        assignedUserId: userId, // Or maybe global activity for user context?
                        // Let's count completion or updates (AuditLogs?)
                        // For velocity usually means removed items from backlog.
                        // Let's stick to completed cards for now.
                        status: 'concluido',
                        completedAt: {
                            gte: dayStart,
                            lte: dayEnd
                        }
                    }
                });
                velocity.push({ date: dayStart, count });
            }

            // 4. Recent Activity (Audit Logs)
            const recentActivity = await prisma.auditLog.findMany({
                where: {
                    // Actions relevant to the user? Or by the user?
                    // "Recent Activity" often implies what happened in projects I'm in.
                    // For now, let's show what *I* did or what happened to *my* cards.
                    // To keep it simple and performant, let's show logs where userId is me.
                    userId: userId
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    action: true,
                    entityTitle: true,
                    entityType: true,
                    createdAt: true,
                    userName: true
                    // status is not in audit log root, but we can infer or mock for UI if needed
                }
            });

            // 5. Upcoming Events
            const upcomingEvents = await prisma.calendarEvent.findMany({
                where: {
                    userId: userId,
                    startAt: { gte: new Date() }
                },
                orderBy: { startAt: 'asc' },
                take: 3
            });


            return reply.send({
                success: true,
                data: {
                    stats: {
                        totalActive: activeCards,
                        dueTodayCount,
                        completedWeek,
                        overdueCount
                    },
                    tasks: {
                        all: allTasks,
                        overdue: overdueTasks
                    },
                    metrics: {
                        velocity
                    },
                    recentActivity: recentActivity.map(log => ({
                        ...log,
                        user: { name: log.userName }, // Format for UI
                        status: log.action === 'complete' ? 'concluido' : 'em_progresso' // Mock status derived
                    })),
                    upcomingEvents
                }
            });

        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ success: false, message: 'Erro ao carregar dashboard' });
        }
    }
};
