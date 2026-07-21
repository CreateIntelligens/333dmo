import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db, schema } from '../db/index.js';
import { getIO } from '../plugins/websocket.js';
import { eq, and, desc, gte, lte, ne } from 'drizzle-orm';
import { config } from '../config/index.js';

function getTenantId(request: FastifyRequest): string {
  const tenantId = request.headers['x-tenant-id'] as string;
  if (!tenantId) throw new Error('Missing X-Tenant-Id header');
  return tenantId;
}

function verifyApiKey(request: FastifyRequest): void {
  const apiKey = request.headers['x-api-key'] as string;
  if (!apiKey || apiKey !== config.apiKey) {
    throw new Error('Invalid or missing API key');
  }
}

export async function activityLogRoutes(app: FastifyInstance) {
  // Receive log from Agent (line-crm)
  app.post('/logs', async (request, reply) => {
    verifyApiKey(request);
    const tenantId = getTenantId(request);

    const body = request.body as {
      user_id?: string;
      permission?: string;
      method: string;
      endpoint: string;
      status_code?: number;
      metadata?: Record<string, any>;
    };

    const logEntry = {
      id: crypto.randomUUID().replace(/-/g, '').slice(0, 26),
      tenantId,
      userId: body.user_id || null,
      permission: body.permission || null,
      method: body.method,
      endpoint: body.endpoint,
      statusCode: body.status_code || null,
      metadata: body.metadata || null,
      createdAt: new Date(),
    };

    await db.insert(schema.activityLogs).values(logEntry);

    const io = getIO();
    if (io && logEntry.permission !== 'materials.show') {
      io.to(`tenant:${tenantId}`).emit('activity:log', {
        id: logEntry.id,
        tenantId: logEntry.tenantId,
        userId: logEntry.userId,
        permission: logEntry.permission,
        method: logEntry.method,
        endpoint: logEntry.endpoint,
        statusCode: logEntry.statusCode,
        createdAt: logEntry.createdAt.toISOString(),
      });
    }

    return reply.status(201).send({ ok: true });
  });

  // Batch receive
  app.post('/logs/batch', async (request, reply) => {
    verifyApiKey(request);
    const tenantId = getTenantId(request);

    const body = request.body as { logs: Array<{
      user_id?: string;
      permission?: string;
      method: string;
      endpoint: string;
      status_code?: number;
      metadata?: Record<string, any>;
      timestamp?: string;
    }> };

    const entries = body.logs.map((log) => ({
      id: crypto.randomUUID().replace(/-/g, '').slice(0, 26),
      tenantId,
      userId: log.user_id || null,
      permission: log.permission || null,
      method: log.method,
      endpoint: log.endpoint,
      statusCode: log.status_code || null,
      metadata: log.metadata || null,
      createdAt: log.timestamp ? new Date(log.timestamp) : new Date(),
    }));

    await db.insert(schema.activityLogs).values(entries);

    const io = getIO();
    if (io) {
      for (const entry of entries) {
        if (entry.permission !== 'materials.show') {
          io.to(`tenant:${tenantId}`).emit('activity:log', {
            ...entry,
            createdAt: entry.createdAt.toISOString(),
          });
        }
      }
    }

    return reply.status(201).send({ ok: true, count: entries.length });
  });

  // Query logs
  app.get('/logs', async (request, reply) => {
    verifyApiKey(request);
    const tenantId = getTenantId(request);

    const query = request.query as {
      limit?: string;
      offset?: string;
      permission?: string;
      user_id?: string;
      start_date?: string;
      end_date?: string;
    };

    const limit = Math.min(parseInt(query.limit || '100'), 1000);
    const offset = parseInt(query.offset || '0');

    const conditions = [
      eq(schema.activityLogs.tenantId, tenantId),
      ne(schema.activityLogs.permission, 'materials.show'),
    ];

    if (query.permission) {
      conditions.push(eq(schema.activityLogs.permission, query.permission));
    }
    if (query.user_id) {
      conditions.push(eq(schema.activityLogs.userId, query.user_id));
    }
    if (query.start_date) {
      conditions.push(gte(schema.activityLogs.createdAt, new Date(query.start_date)));
    }
    if (query.end_date) {
      conditions.push(lte(schema.activityLogs.createdAt, new Date(query.end_date)));
    }

    const logs = await db
      .select()
      .from(schema.activityLogs)
      .where(and(...conditions))
      .orderBy(desc(schema.activityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return reply.send({ data: logs });
  });
}
