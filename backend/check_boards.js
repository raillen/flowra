import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.board.count();
        console.log('Board Count:', count);
        if (count === 0) {
            console.log('Creating Default Board...');
            const project = await prisma.project.create({ data: { name: 'Default Project' } });
            const board = await prisma.board.create({ data: { name: 'Default Board', projectId: project.id } });
            const column = await prisma.column.create({ data: { title: 'To Do', boardId: board.id, order: 0 } });
            console.log('Created Default Board and Column:', board.id, column.id);
        } else {
            const board = await prisma.board.findFirst();
            const col = await prisma.column.findFirst({ where: { boardId: board.id } });
            console.log('Existing Board:', board.id, 'Column:', col ? col.id : 'NONE');
            if (!col) {
                const column = await prisma.column.create({ data: { title: 'To Do', boardId: board.id, order: 0 } });
                console.log('Created missing column for existing board');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
