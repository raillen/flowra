import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const template = await prisma.briefingTemplate.findFirst({
            where: { name: 'Test Briefing' },
            orderBy: { createdAt: 'desc' }
        });
        console.log('TOKEN:', template ? template.publicToken : 'NOT_FOUND');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
