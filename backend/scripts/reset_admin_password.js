
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../src/config/logger.js';

const prisma = new PrismaClient();

async function main() {
    logger.info('Resetting admin password...');

    const email = 'admin@kbsys.com';
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Check if user exists first
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        logger.info(`User ${email} found. Updating password...`);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
        logger.info('Password updated successfully.');
    } else {
        logger.info(`User ${email} not found. Creating user...`);
        await prisma.user.create({
            data: {
                email,
                name: 'Administrador',
                password: hashedPassword,
                role: 'admin',
            },
        });
        logger.info('User created successfully.');
    }
}

main()
    .catch((error) => {
        logger.error({ error }, 'Error resetting password');
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
