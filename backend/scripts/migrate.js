import { execSync } from 'child_process';
import { logger } from '../src/config/logger.js';

/**
 * Migration script
 * Runs Prisma migrations in production
 * 
 * @module scripts/migrate
 */

try {
  logger.info('Running database migrations...');
  
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env,
  });
  
  logger.info('Migrations completed successfully');
  process.exit(0);
} catch (error) {
  logger.error({ error }, 'Migration failed');
  process.exit(1);
}

