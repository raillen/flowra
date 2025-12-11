import { prisma } from '../src/config/database.js';

/**
 * Health check script
 * Verifies database connection and application health
 * Used by Docker healthcheck
 * 
 * @module scripts/health-check
 */

async function healthCheck() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    console.log('Health check passed');
    process.exit(0);
  } catch (error) {
    console.error('Health check failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

healthCheck();

