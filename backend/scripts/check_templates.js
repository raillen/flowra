import { prisma } from '../src/config/database.js';
import fs from 'fs';
import path from 'path';

async function check() {
    console.log("Checking Briefing Templates...");
    const templates = await prisma.briefingTemplate.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5
    });

    const output = templates.map(t => ({
        id: t.id,
        name: t.name,
        isPublic: t.isPublic,
        publicToken: t.publicToken
    }));

    console.log(JSON.stringify(output, null, 2));

    fs.writeFileSync(path.resolve('db_dump.json'), JSON.stringify(output, null, 2));
}

check()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
