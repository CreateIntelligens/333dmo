import type { FastifyInstance } from 'fastify';
import { db, schema } from '../db/index.js';
import { eq, and, desc, gte, lte, sql, ne } from 'drizzle-orm';
import dayjs from 'dayjs';

function getTenantId(request: any): string {
  const tenantId = request.headers['x-tenant-id'] as string;
  if (!tenantId) throw new Error('Missing X-Tenant-Id header');
  return tenantId;
}

export async function statsRoutes(app: FastifyInstance) {
  // List all known tenants
  app.get('/tenants', async (_request, reply) => {
    const result = await db
      .selectDistinct({ tenantId: schema.activityLogs.tenantId })
      .from(schema.activityLogs)
      .where(ne(schema.activityLogs.tenantId, ''));

    return reply.send({
      data: result.map((r) => r.tenantId),
    });
  });
  // Feature usage frequency
  app.get('/stats/features', async (request, reply) => {
    const tenantId = getTenantId(request);
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
          gte(schema.activityLogs.createdAt, since),
          ne(schema.activityLogs.permission, 'materials.show')
        )
      )
      .groupBy(schema.activityLogs.permission)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return reply.send({ data: result, period: `${days}d` });
  });

  // Usage over time (hourly or daily)
  app.get('/stats/timeline', async (request, reply) => {
    const tenantId = getTenantId(request);
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
          gte(schema.activityLogs.createdAt, since),
          ne(schema.activityLogs.permission, 'materials.show')
        )
      )
      .groupBy(sql`date_trunc(${sql.raw(`'${truncUnit}'`)}, ${schema.activityLogs.createdAt})`)
      .orderBy(sql`date_trunc(${sql.raw(`'${truncUnit}'`)}, ${schema.activityLogs.createdAt})`);

    return reply.send({ data: result, period: `${days}d`, granularity });
  });

  // User activity ranking
  app.get('/stats/users', async (request, reply) => {
    const tenantId = getTenantId(request);
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
          gte(schema.activityLogs.createdAt, since),
          ne(schema.activityLogs.permission, 'materials.show')
        )
      )
      .groupBy(schema.activityLogs.userId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return reply.send({ data: result, period: `${days}d` });
  });

  // Overview KPIs
  app.get('/stats/overview', async (request, reply) => {
    const tenantId = getTenantId(request);
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
          gte(schema.activityLogs.createdAt, since),
          ne(schema.activityLogs.permission, 'materials.show')
        )
      );

    const [uniqueUsers] = await db
      .select({ count: sql<number>`count(distinct ${schema.activityLogs.userId})::int` })
      .from(schema.activityLogs)
      .where(
        and(
          eq(schema.activityLogs.tenantId, tenantId),
          gte(schema.activityLogs.createdAt, since),
          ne(schema.activityLogs.permission, 'materials.show')
        )
      );

    const [uniqueFeatures] = await db
      .select({ count: sql<number>`count(distinct ${schema.activityLogs.permission})::int` })
      .from(schema.activityLogs)
      .where(
        and(
          eq(schema.activityLogs.tenantId, tenantId),
          gte(schema.activityLogs.createdAt, since),
          ne(schema.activityLogs.permission, 'materials.show')
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

  // Stats comparison (Today vs Yesterday, This Week vs Last Week)
  app.get('/stats/comparison', async (request, reply) => {
    const tenantId = getTenantId(request);

    const now = dayjs();
    
    // Today so far: 00:00:00 today -> now
    const todayStart = now.startOf('day');
    const todayEnd = now;

    // Yesterday so far: 00:00:00 yesterday -> same time yesterday
    const yesterdayStart = now.subtract(1, 'day').startOf('day');
    const yesterdayEnd = now.subtract(1, 'day');

    // This week so far: Monday 00:00:00 of this week -> now
    const dayOfWeek = now.day();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const thisWeekStart = now.subtract(daysToSubtract, 'day').startOf('day');
    const thisWeekEnd = now;

    // Last week same period: last Monday 00:00:00 -> last week same time
    const lastWeekStart = thisWeekStart.subtract(7, 'day');
    const lastWeekEnd = now.subtract(7, 'day');

    const getMetrics = async (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
      const [requests] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.activityLogs)
        .where(
          and(
            eq(schema.activityLogs.tenantId, tenantId),
            gte(schema.activityLogs.createdAt, start.toDate()),
            lte(schema.activityLogs.createdAt, end.toDate()),
            ne(schema.activityLogs.permission, 'materials.show')
          )
        );

      const [users] = await db
        .select({ count: sql<number>`count(distinct ${schema.activityLogs.userId})::int` })
        .from(schema.activityLogs)
        .where(
          and(
            eq(schema.activityLogs.tenantId, tenantId),
            gte(schema.activityLogs.createdAt, start.toDate()),
            lte(schema.activityLogs.createdAt, end.toDate()),
            ne(schema.activityLogs.permission, 'materials.show')
          )
        );

      const [features] = await db
        .select({ count: sql<number>`count(distinct ${schema.activityLogs.permission})::int` })
        .from(schema.activityLogs)
        .where(
          and(
            eq(schema.activityLogs.tenantId, tenantId),
            gte(schema.activityLogs.createdAt, start.toDate()),
            lte(schema.activityLogs.createdAt, end.toDate()),
            ne(schema.activityLogs.permission, 'materials.show')
          )
        );

      return {
        requests: requests?.count || 0,
        users: users?.count || 0,
        features: features?.count || 0,
      };
    };

    const [todayStats, yesterdayStats, thisWeekStats, lastWeekStats] = await Promise.all([
      getMetrics(todayStart, todayEnd),
      getMetrics(yesterdayStart, yesterdayEnd),
      getMetrics(thisWeekStart, thisWeekEnd),
      getMetrics(lastWeekStart, lastWeekEnd),
    ]);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    };

    return reply.send({
      data: {
        daily: {
          today: todayStats,
          yesterday: yesterdayStats,
          change: {
            requests: calculateChange(todayStats.requests, yesterdayStats.requests),
            users: calculateChange(todayStats.users, yesterdayStats.users),
            features: calculateChange(todayStats.features, yesterdayStats.features),
          },
        },
        weekly: {
          thisWeek: thisWeekStats,
          lastWeek: lastWeekStats,
          change: {
            requests: calculateChange(thisWeekStats.requests, lastWeekStats.requests),
            users: calculateChange(thisWeekStats.users, lastWeekStats.users),
            features: calculateChange(thisWeekStats.features, lastWeekStats.features),
          },
        },
      },
    });
  });

  // Marquee stats (for all tenants)
  app.get('/stats/marquee', async (_request, reply) => {
    const distinctTenants = await db
      .selectDistinct({ tenantId: schema.activityLogs.tenantId })
      .from(schema.activityLogs)
      .where(ne(schema.activityLogs.tenantId, ''));

    const tenantsList = distinctTenants.map((t) => t.tenantId);

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const activeUsers = await db
      .select({
        tenantId: schema.activityLogs.tenantId,
        count: sql<number>`count(distinct ${schema.activityLogs.userId})::int`,
      })
      .from(schema.activityLogs)
      .where(
        and(
          gte(schema.activityLogs.createdAt, tenMinutesAgo),
          ne(schema.activityLogs.permission, 'materials.show')
        )
      )
      .groupBy(schema.activityLogs.tenantId);

    const apiCounts = await db
      .select({
        tenantId: schema.activityLogs.tenantId,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.activityLogs)
      .where(
        and(
          gte(schema.activityLogs.createdAt, twentyFourHoursAgo),
          ne(schema.activityLogs.permission, 'materials.show')
        )
      )
      .groupBy(schema.activityLogs.tenantId);

    const activeUsersMap = new Map(activeUsers.map((item) => [item.tenantId, item.count]));
    const apiCountsMap = new Map(apiCounts.map((item) => [item.tenantId, item.count]));

    const data = tenantsList.map((tId) => ({
      tenantId: tId,
      onlineUsers: activeUsersMap.get(tId) || 0,
      apiCount24h: apiCountsMap.get(tId) || 0,
    }));

    return reply.send({ data });
  });
}
