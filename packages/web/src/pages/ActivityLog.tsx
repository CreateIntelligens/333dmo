import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useStore } from '../stores/useStore';
import { useRealtimeLogs } from '../hooks/useRealtimeLogs';
import { getPermissionLabel } from '../lib/permissions';

export default function ActivityLog() {
  const { tenantId } = useStore();
  const { logs: realtimeLogs, connected } = useRealtimeLogs(tenantId);

  const { data: historicalLogs } = useQuery({
    queryKey: ['logs', tenantId],
    queryFn: () => api.getLogs({ limit: '50' }),
  });

  const allLogs = [...realtimeLogs, ...(historicalLogs?.data || [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">即時活動串流</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: connected ? 'var(--green)' : 'var(--red)' }} />
          <span className="text-muted">{connected ? 'WebSocket 已連線' : '斷線中'}</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left p-3 text-muted font-medium">時間</th>
              <th className="text-left p-3 text-muted font-medium">使用者</th>
              <th className="text-left p-3 text-muted font-medium">功能</th>
              <th className="text-left p-3 text-muted font-medium">方法</th>
              <th className="text-left p-3 text-muted font-medium">Endpoint</th>
              <th className="text-left p-3 text-muted font-medium">狀態</th>
            </tr>
          </thead>
          <tbody>
            {allLogs.map((log) => (
              <tr key={log.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="p-3 text-muted">
                  {new Date(log.createdAt).toLocaleString('zh-TW')}
                </td>
                <td className="p-3 text-primary">{log.userId || '—'}</td>
                <td className="p-3">
                  <span
                    className="px-2 py-0.5 rounded-md text-xs font-medium"
                    style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                    title={log.permission || ''}
                  >
                    {getPermissionLabel(log.permission)}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className="px-2 py-0.5 rounded-md text-xs font-mono font-medium"
                    style={{
                      backgroundColor:
                        log.method === 'GET' ? 'var(--green-soft)' :
                        log.method === 'POST' ? 'var(--yellow-soft)' :
                        log.method === 'PUT' ? 'var(--accent-soft)' :
                        'var(--red-soft)',
                      color:
                        log.method === 'GET' ? 'var(--green)' :
                        log.method === 'POST' ? 'var(--yellow)' :
                        log.method === 'PUT' ? 'var(--accent)' :
                        'var(--red)',
                    }}
                  >
                    {log.method}
                  </span>
                </td>
                <td className="p-3 text-secondary font-mono text-xs">{log.endpoint}</td>
                <td className="p-3">
                  <span
                    className="text-xs font-medium"
                    style={{ color: log.statusCode && log.statusCode < 400 ? 'var(--green)' : 'var(--red)' }}
                  >
                    {log.statusCode || '—'}
                  </span>
                </td>
              </tr>
            ))}
            {allLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  等待活動資料...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
