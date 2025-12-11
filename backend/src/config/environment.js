import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment configuration module
 * Centralizes all environment variables with validation and defaults
 * 
 * @module config/environment
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NODE_ENV'
];

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required variable is missing
 */
function validateEnvironment() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Environment configuration object
 * @type {Object}
 * @property {string} nodeEnv - Application environment (development|production|test)
 * @property {number} port - Server port
 * @property {string} host - Server host
 * @property {string} databaseUrl - PostgreSQL connection string
 * @property {string} jwtSecret - Secret key for JWT tokens
 * @property {number} jwtExpiresIn - JWT token expiration time in seconds
 * @property {string} corsOrigin - Allowed CORS origins
 * @property {boolean} enableSwagger - Whether to enable Swagger documentation
 */
export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: parseInt(process.env.JWT_EXPIRES_IN || '86400', 10), // 24 hours
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,http://127.0.0.1:5173',
  enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
};

// Validate on module load
validateEnvironment();

export default config;

