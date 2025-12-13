import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('Model briefingSubmission exists:', !!prisma.briefingSubmission);
}
main().finally(() => prisma.$disconnect());
