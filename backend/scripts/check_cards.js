import { prisma } from '../src/config/database.js';
import fs from 'fs';
import path from 'path';

async function check() {
    console.log("Checking Recent Cards...");
    const cards = await prisma.card.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { briefingTemplate: true }
    });

    const output = cards.map(c => ({
        id: c.id,
        title: c.title,
        status: c.status,
        templateName: c.briefingTemplate?.name,
        briefingData: c.briefingData
    }));

    fs.writeFileSync(path.resolve('cards_dump.json'), JSON.stringify(output, null, 2));
}

check()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
