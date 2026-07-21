import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useStore } from '../stores/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function FeatureUsage() {
  const { tenantId, period } = useStore();

  const { data: features, isLoading } = useQuery({
    queryKey: ['features', tenantId, period],
    queryFn: () => api.getFeatures(period),
  });

  const featureData = features?.data || [];
  const total = featureData.reduce((sum: number, f: any) => sum + f.count, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">功能使用頻率</h2>

      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">各功能呼叫次數（{period}）</h3>
        <ResponsiveContainer width="100%" height={Math.max(300, featureData.length * 40)}>
          <BarChart data={featureData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="permission" tick={{ fontSize: 11, fill: '#94a3b8' }} width={160} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              formatter={(value: number) => [`${value} 次`, '使用次數']}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left p-3">功能</th>
              <th className="text-right p-3">使用次數</th>
              <th className="text-right p-3">佔比</th>
            </tr>
          </thead>
          <tbody>
            {featureData.map((item: any) => (
              <tr key={item.permission} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="p-3">{item.permission || '未分類'}</td>
                <td className="p-3 text-right font-mono">{item.count.toLocaleString()}</td>
                <td className="p-3 text-right text-slate-400">
                  {total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
