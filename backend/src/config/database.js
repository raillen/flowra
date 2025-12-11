import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
import { config } from './environment.js';

/**
 * Database configuration module
 * Manages Prisma client instance with connection pooling and error handling
 * 
 * @module config/database
 */

/**
 * Creates a new Prisma client instance with optimized configuration
 * @returns {PrismaClient} Configured Prisma client
 */
function createPrismaClient() {
  const prisma = new PrismaClient({
    log: config.nodeEnv === 'development' 
      ? ['query', 'error', 'warn']
      : ['error'],
    errorFormat: 'pretty',
  });

  // Handle graceful shutdown
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  });

  return prisma;
}

export const prisma = createPrismaClient();

/**
 * Tests database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export async function testConnection() {
  try {
    await prisma.$connect();
    logger.info('Database connection established');
    return true;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to database');
    throw error;
  }
}

export default prisma;

