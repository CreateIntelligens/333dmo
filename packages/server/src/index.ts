import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/index.js';
import { db } from './db/index.js';
import { activityLogRoutes } from './routes/activity-logs.js';
import { statsRoutes } from './routes/stats.js';
import { setupWebSocket } from './plugins/websocket.js';
import { setupApiKeyAuth } from './plugins/auth.js';

const app = Fastify({
  logger: {
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
    transport:
      config.nodeEnv === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
});

// Plugins
await app.register(cors, { origin: config.corsOrigin });
await app.register(setupApiKeyAuth);
await app.register(setupWebSocket);

// Routes
await app.register(activityLogRoutes, { prefix: '/api/v1' });
await app.register(statsRoutes, { prefix: '/api/v1' });

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Start
const start = async () => {
  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`Server running on http://${config.host}:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
