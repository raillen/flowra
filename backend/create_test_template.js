import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
const prisma = new PrismaClient();

async function main() {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const fields = [
            { id: 'field_1', type: 'text', label: 'Name', placeholder: 'Enter your name', required: true }
        ];

        const template = await prisma.briefingTemplate.create({
            data: {
                name: 'API Test Briefing',
                description: 'Created via automation',
                fields: JSON.stringify(fields),
                isPublic: true,
                publicToken: token
            }
        });
        console.log('TOKEN:', template.publicToken);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
