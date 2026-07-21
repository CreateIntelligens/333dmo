import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useStore } from '../stores/useStore';
import { getPermissionLabel } from '../lib/permissions';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#7aa2f7', '#bb9af7', '#7dcfff', '#e0af68', '#9ece6a', '#f7768e', '#ff9e64', '#73daca'];

export default function FeatureUsage() {
  const { tenantId, period } = useStore();

  const { data: features } = useQuery({
    queryKey: ['features', tenantId, period],
    queryFn: () => api.getFeatures(period),
  });

  const featureData = (features?.data || []).map((f: any) => ({
    ...f,
    label: getPermissionLabel(f.permission),
  }));
  const total = featureData.reduce((sum: number, f: any) => sum + f.count, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">功能使用頻率</h2>

      <div className="card p-6">
        <h3 className="text-sm font-medium text-secondary mb-4">
          各功能呼叫次數（{period}）
        </h3>
        <ResponsiveContainer width="100%" height={Math.max(300, featureData.length * 40)}>
          <BarChart data={featureData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={140} />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {featureData.map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left p-3 text-muted font-medium">功能</th>
              <th className="text-left p-3 text-muted font-medium">Permission</th>
              <th className="text-right p-3 text-muted font-medium">使用次數</th>
              <th className="text-right p-3 text-muted font-medium">佔比</th>
            </tr>
          </thead>
          <tbody>
            {featureData.map((item: any) => (
              <tr key={item.permission} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="p-3 font-medium text-primary">{item.label}</td>
                <td className="p-3 text-muted font-mono text-xs">{item.permission || '—'}</td>
                <td className="p-3 text-right font-mono text-primary">{item.count.toLocaleString()}</td>
                <td className="p-3 text-right text-muted">
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
