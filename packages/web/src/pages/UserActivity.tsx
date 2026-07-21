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
      <h2 className="text-2xl font-bold">使用者活動排行</h2>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left p-3">#</th>
              <th className="text-left p-3">使用者 ID</th>
              <th className="text-right p-3">API 呼叫次數</th>
              <th className="text-left p-3">最後活動時間</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((item: any, index: number) => (
              <tr key={item.userId} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="p-3 text-slate-500">{index + 1}</td>
                <td className="p-3 font-mono">{item.userId || '未知'}</td>
                <td className="p-3 text-right font-mono">{item.count.toLocaleString()}</td>
                <td className="p-3 text-slate-400">
                  {item.lastActive ? new Date(item.lastActive).toLocaleString('zh-TW') : '-'}
                </td>
              </tr>
            ))}
            {userData.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
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
