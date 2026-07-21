import { useStore } from '../stores/useStore';

const API_BASE = '/api/v1';

async function request(path: string, options?: RequestInit) {
  const tenantId = useStore.getState().tenantId;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenantId,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getTenants: () => fetch(`${API_BASE}/tenants`).then((r) => r.json()),
  getOverview: (period = '7d') => request(`/stats/overview?period=${period}`),
  getFeatures: (period = '7d') => request(`/stats/features?period=${period}`),
  getTimeline: (period = '7d', granularity = 'hour') =>
    request(`/stats/timeline?period=${period}&granularity=${granularity}`),
  getUsers: (period = '7d') => request(`/stats/users?period=${period}`),
  getComparison: () => request(`/stats/comparison`),
  getMarquee: () => fetch(`${API_BASE}/stats/marquee`).then((r) => r.json()),
  getLogs: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return request(`/logs?${query}`);
  },
};
