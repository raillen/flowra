import { PrismaClient } from '@prisma/client';
import { dashboardService } from '../src/services/dashboard.service.js';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log('No user found');
        return;
    }
    console.log('Testing for user:', user.email);

    try {
        const data = await dashboardService.getGlobalData(user.id);
        console.log('SUCCESS: Retrieved Global Dashboard Data');
        console.log('Stats:', data.stats);
        console.log('Activity Count:', data.recentActivity ? data.recentActivity.length : 0);
        console.log('Unified Tasks Count:', data.tasks.all.length);
        console.log('Velocity Chart Points:', data.metrics.velocity.length);
    } catch (e) {
        console.error('FAILED:', e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
