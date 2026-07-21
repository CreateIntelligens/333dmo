import type { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { config } from '../config/index.js';

let io: SocketIOServer;

export function getIO() {
  return io;
}

export async function setupWebSocket(app: FastifyInstance) {
  const httpServer = app.server;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
    path: '/ws',
  });

  io.on('connection', (socket) => {
    app.log.debug(`WebSocket client connected: ${socket.id}`);

    // Client sends this to join a tenant room
    socket.on('subscribe:tenant', (tenantId: string) => {
      socket.join(`tenant:${tenantId}`);
      app.log.debug(`Socket ${socket.id} subscribed to tenant:${tenantId}`);
    });

    socket.on('unsubscribe:tenant', (tenantId: string) => {
      socket.leave(`tenant:${tenantId}`);
    });

    socket.on('disconnect', () => {
      app.log.debug(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  app.log.info('WebSocket server initialized');
}
