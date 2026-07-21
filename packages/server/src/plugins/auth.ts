import type { FastifyInstance } from 'fastify';
import { config } from '../config/index.js';

export async function setupApiKeyAuth(app: FastifyInstance) {
  app.decorateRequest('tenantId', null);

  app.addHook('preHandler', async (request, reply) => {
    // Skip auth for health check
    if (request.url === '/health') return;

    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey || apiKey !== config.apiKey) {
      return reply.status(401).send({ error: 'Invalid or missing API key' });
    }

    // Extract tenant_id from header (Agent sends this)
    const tenantId = request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      return reply.status(400).send({ error: 'Missing X-Tenant-Id header' });
    }

    (request as any).tenantId = tenantId;
  });
}
