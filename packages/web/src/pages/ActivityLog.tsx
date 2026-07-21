import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useStore } from '../stores/useStore';
import { useRealtimeLogs } from '../hooks/useRealtimeLogs';

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
        <h2 className="text-2xl font-bold">即時活動串流</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-slate-400">{connected ? 'WebSocket 已連線' : '斷線中'}</span>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left p-3">時間</th>
              <th className="text-left p-3">使用者</th>
              <th className="text-left p-3">功能</th>
              <th className="text-left p-3">方法</th>
              <th className="text-left p-3">Endpoint</th>
              <th className="text-left p-3">狀態</th>
            </tr>
          </thead>
          <tbody>
            {allLogs.map((log) => (
              <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="p-3 text-slate-400">
                  {new Date(log.createdAt).toLocaleString('zh-TW')}
                </td>
                <td className="p-3">{log.userId || '-'}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs">
                    {log.permission || '-'}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                    log.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                    log.method === 'POST' ? 'bg-yellow-500/20 text-yellow-400' :
                    log.method === 'PUT' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {log.method}
                  </span>
                </td>
                <td className="p-3 text-slate-300 font-mono text-xs">{log.endpoint}</td>
                <td className="p-3">
                  <span className={`text-xs ${
                    log.statusCode && log.statusCode < 400 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {log.statusCode || '-'}
                  </span>
                </td>
              </tr>
            ))}
            {allLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
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
