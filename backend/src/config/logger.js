import pino from 'pino';
import { config } from './environment.js';

/**
 * Logger configuration module
 * Provides structured logging using Pino
 * 
 * @module config/logger
 */

/**
 * Creates and configures the application logger
 * @returns {pino.Logger} Configured Pino logger instance
 */
export function createLogger() {
  const isDevelopment = config.nodeEnv === 'development';

  return pino({
    level: config.logLevel,
    redact: ['req.headers.authorization', 'req.body.password', 'req.body.token', 'req.body.refreshToken'],
    transport: isDevelopment
      ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
      : undefined,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

export const logger = createLogger();

export default logger;

