import { pgTable, varchar, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: varchar('id', { length: 26 }).primaryKey(), // ULID
    tenantId: varchar('tenant_id', { length: 50 }).notNull(),
    userId: varchar('user_id', { length: 100 }),
    permission: varchar('permission', { length: 100 }),
    method: varchar('method', { length: 10 }).notNull(),
    endpoint: varchar('endpoint', { length: 500 }).notNull(),
    statusCode: integer('status_code'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_activity_tenant_created').on(table.tenantId, table.createdAt),
    index('idx_activity_permission').on(table.permission),
    index('idx_activity_user').on(table.userId),
    index('idx_activity_created').on(table.createdAt),
  ]
);

export const tenants = pgTable('tenants', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  apiKey: varchar('api_key', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Tenant = typeof tenants.$inferSelect;
