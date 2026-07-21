import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useStore } from '../stores/useStore';

export default function UserActivity() {
  const { tenantId, period } = useStore();

  const { data: users } = useQuery({
    queryKey: ['users', tenantId, period],
    queryFn: () => api.getUsers(period),
  });

  const userData = users?.data || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">使用者活動排行</h2>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left p-3 text-muted font-medium">#</th>
              <th className="text-left p-3 text-muted font-medium">使用者 ID</th>
              <th className="text-right p-3 text-muted font-medium">API 呼叫次數</th>
              <th className="text-left p-3 text-muted font-medium">最後活動時間</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((item: any, index: number) => (
              <tr key={item.userId} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="p-3 text-muted">{index + 1}</td>
                <td className="p-3 font-mono text-primary">{item.userId || '未知'}</td>
                <td className="p-3 text-right font-mono text-primary">{item.count.toLocaleString()}</td>
                <td className="p-3 text-secondary">
                  {item.lastActive ? new Date(item.lastActive).toLocaleString('zh-TW') : '—'}
                </td>
              </tr>
            ))}
            {userData.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted">
                  尚無使用者活動資料
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
