import crypto from 'crypto';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { config } from './config/environment.js';
import { logger } from './config/logger.js';
import { testConnection } from './config/database.js';
import { errorHandler } from './middleware/error.middleware.js';
import { authRoutes } from './routes/auth.routes.js';
import { projectRoutes } from './routes/project.routes.js';
import { companyRoutes } from './routes/company.routes.js';
import { collaboratorRoutes } from './routes/collaborator.routes.js';
import { boardRoutes } from './routes/board.routes.js';
import { groupRoutes } from './routes/group.routes.js';
import { columnRoutes } from './routes/column.routes.js';
import { cardRoutes } from './routes/card.routes.js';
import { commentRoutes } from './routes/comment.routes.js';
import { tagRoutes } from './routes/tag.routes.js';
import { attachmentRoutes } from './routes/attachment.routes.js';
import { noteRoutes } from './routes/note.routes.js';
import { calendarRoutes } from './routes/calendar.routes.js';
import { notificationRoutes } from './routes/notification.routes.js';
import { transferRoutes } from './routes/transfer.routes.js';
import { chatRoutes } from './routes/chat.routes.js';
import { dashboardRoutes } from './routes/dashboard.routes.js';
import profileRoutes from './routes/profile.routes.js';
import briefingRoutes from './routes/briefing.routes.js';
import docsRoutes from './routes/docs.routes.js';
import statsRoutes from './routes/stats.routes.js';
import filterRoutes from './routes/filter.routes.js';
import { initializeSocket } from './config/socket.js';

/**
 * Application entry point
 * Initializes and configures Fastify server
 * 
 * @module app
 */

/**
 * Creates and configures Fastify application instance
 * @returns {FastifyInstance} Configured Fastify instance
 */
async function createApp() {
  const app = Fastify({
    logger: logger,
    requestIdLogLabel: 'reqId',
    genReqId: () => crypto.randomUUID(),
  });

  // Security plugins
  await app.register(helmet, {
    contentSecurityPolicy: false, // Adjust for Swagger UI
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  });

  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        logger.debug('CORS: Request with no origin, allowing');
        return cb(null, true);
      }

      // Parse CORS_ORIGIN - can be comma-separated list or '*'
      const allowedOrigins = config.corsOrigin === '*'
        ? true
        : config.corsOrigin.split(',').map(o => o.trim());

      logger.debug({ origin, allowedOrigins, corsOrigin: config.corsOrigin }, 'CORS: Checking origin');

      if (allowedOrigins === true || allowedOrigins.includes(origin)) {
        logger.debug({ origin }, 'CORS: Origin allowed');
        return cb(null, true);
      }

      logger.warn({ origin, allowedOrigins }, 'CORS: Origin not allowed');
      return cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
  });

  // JWT authentication
  await app.register(jwt, {
    secret: config.jwtSecret,
    sign: {
      expiresIn: config.jwtExpiresIn,
    },
  });

  // Swagger documentation
  if (config.enableSwagger) {
    await app.register(swagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'KBSys API',
          description: 'Project Management System API',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${config.port}`,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    });

    await app.register(swaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    });
  }

  // Health check endpoint
  app.get('/health', async (request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Register routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(projectRoutes, { prefix: '/api/projects' });
  await app.register(companyRoutes, { prefix: '/api/companies' });
  await app.register(collaboratorRoutes, { prefix: '/api/collaborators' });
  await app.register(groupRoutes, { prefix: '/api/groups' });
  await app.register(boardRoutes, { prefix: '/api' });
  await app.register(columnRoutes, { prefix: '/api' });
  await app.register(cardRoutes, { prefix: '/api' });
  await app.register(commentRoutes, { prefix: '/api' });
  await app.register(tagRoutes, { prefix: '/api' });
  await app.register(attachmentRoutes, { prefix: '/api' });
  await app.register(noteRoutes, { prefix: '/api' });
  await app.register(calendarRoutes, { prefix: '/api' });
  await app.register(notificationRoutes, { prefix: '/api' });
  await app.register(profileRoutes, { prefix: '/api/profile' });
  await app.register(transferRoutes, { prefix: '/api' });
  await app.register(chatRoutes, { prefix: '/api' });
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
  await app.register(briefingRoutes, { prefix: '/api/briefing' });
  await app.register(docsRoutes, { prefix: '/api' });
  await app.register(statsRoutes, { prefix: '/api' });
  await app.register(filterRoutes, { prefix: '/api' });

  // Error handling
  app.setErrorHandler(errorHandler);

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    logger.info({ signal }, 'Received shutdown signal');
    try {
      await app.close();
      logger.info('Server closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error({ error }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return app;
}

/**
 * Starts the application server
 */
async function start() {
  try {
    // Test database connection
    await testConnection();

    // Create app
    const app = await createApp();

    // Start server
    await app.listen({
      port: config.port,
      host: config.host,
    });

    // Initialize Socket.io after server is listening
    initializeSocket(app);

    logger.info(
      { port: config.port, env: config.nodeEnv },
      'Server started successfully with Socket.io'
    );
  } catch (error) {
    console.error('SERVER STARTUP ERROR:', error);
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Start application
start();

