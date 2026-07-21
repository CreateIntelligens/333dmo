import type { FastifyInstance } from 'fastify';
import { db, schema } from '../db/index.js';
import { eq, and, desc, gte, sql } from 'drizzle-orm';

export async function statsRoutes(app: FastifyInstance) {
  // Feature usage frequency
  app.get('/stats/features', async (request, reply) => {
    const tenantId = (request as any).tenantId;
    const query = request.query as { period?: string; limit?: string };

    const days = parseInt(query.period?.replace('d', '') || '7');
    const limit = parseInt(query.limit || '20');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await db
      .select({
        permission: schema.activityLogs.permission,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.activityLogs)
      .where(
        and(
          eq(schema.activityLogs.tenantId, tenantId),
          gte(schema.activityLogs.createdAt, since)
        )
      )
      .groupBy(schema.activityLogs.permission)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return reply.send({ data: result, period: `${days}d` });
  });

  // Usage over time (hourly or daily)
  app.get('/stats/timeline', async (request, reply) => {
    const tenantId = (request as any).tenantId;
    const query = request.query as { period?: string; granularity?: string };

    const days = parseInt(query.period?.replace('d', '') || '7');
    const granularity = query.granularity || 'hour'; // 'hour' or 'day'
    const since = new Date();
    since.setDate(since.getDate() - days);

    const truncUnit = granularity === 'day' ? 'day' : 'hour';

    const result = await db
      .select({
        timeBucket: sql<Date>`date_trunc(${sql.raw(`'${truncUnit}'`)}, ${schema.activityLogs.createdAt})`,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.activityLogs)
      .where(
        and(
          eq(schema.activityLogs.tenantId, tenantId),
          gte(schema.activityLogs.createdAt, since)
        )
      )
      .groupBy(sql`date_trunc(${sql.raw(`'${truncUnit}'`)}, ${schema.activityLogs.createdAt})`)
      .orderBy(sql`date_trunc(${sql.raw(`'${truncUnit}'`)}, ${schema.activityLogs.createdAt})`);

    return reply.send({ data: result, period: `${days}d`, granularity });
  });

  // User activity ranking
  app.get('/stats/users', async (request, reply) => {
    const tenantId = (request as any).tenantId;
    const query = request.query as { period?: string; limit?: string };

    const days = parseInt(query.period?.replace('d', '') || '7');
    const limit = parseInt(query.limit || '20');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await db
      .select({
        userId: schema.activityLogs.userId,
        count: sql<number>`count(*)::int`,
        lastActive: sql<Date>`max(${schema.activityLogs.createdAt})`,
      })
      .from(schema.activityLogs)
      .where(
        and(
          eq(schema.activityLogs.tenantId, tenantId),
          gte(schema.activityLogs.createdAt, since)
        )
      )
      .groupBy(schema.activityLogs.userId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return reply.send({ data: result, period: `${days}d` });
  });

  // Overview KPIs
  app.get('/stats/overview', async (request, reply) => {
    const tenantId = (request as any).tenantId;
    const query = request.query as { period?: string };

    const days = parseInt(query.period?.replace('d', '') || '7');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalRequests] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.activityLogs)
      .where(
        and(
          eq(schema.activityLogs.tenantId, tenantId),
          gte(schema.activityLogs.createdAt, since)
        )
      );

    const [uniqueUsers] = await db
      .select({ count: sql<number>`count(distinct ${schema.activityLogs.userId})::int` })
      .from(schema.activityLogs)
      .where(
        and(
          eq(schema.activityLogs.tenantId, tenantId),
          gte(schema.activityLogs.createdAt, since)
        )
      );

    const [uniqueFeatures] = await db
      .select({ count: sql<number>`count(distinct ${schema.activityLogs.permission})::int` })
      .from(schema.activityLogs)
      .where(
        and(
          eq(schema.activityLogs.tenantId, tenantId),
          gte(schema.activityLogs.createdAt, since)
        )
      );

    return reply.send({
      data: {
        totalRequests: totalRequests.count,
        uniqueUsers: uniqueUsers.count,
        uniqueFeatures: uniqueFeatures.count,
        period: `${days}d`,
      },
    });
  });
}
