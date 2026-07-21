import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useStore } from '../stores/useStore';
import { getPermissionLabel } from '../lib/permissions';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

const COLORS = ['#7aa2f7', '#bb9af7', '#7dcfff', '#e0af68', '#9ece6a', '#f7768e', '#ff9e64', '#73daca'];

export default function Dashboard() {
  const { tenantId, period } = useStore();

  const { data: overview } = useQuery({
    queryKey: ['overview', tenantId, period],
    queryFn: () => api.getOverview(period),
  });

  const { data: features } = useQuery({
    queryKey: ['features', tenantId, period],
    queryFn: () => api.getFeatures(period),
  });

  const { data: timeline } = useQuery({
    queryKey: ['timeline', tenantId, period],
    queryFn: () => api.getTimeline(period),
  });

  const overviewData = overview?.data;
  const featureData = (features?.data || []).map((f: any) => ({
    ...f,
    label: getPermissionLabel(f.permission),
  }));
  const timelineData = (timeline?.data || []).map((item: any) => ({
    time: new Date(item.timeBucket).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit' }),
    count: item.count,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">儀表板</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard title="總 API 呼叫" value={overviewData?.totalRequests || 0} icon="📡" />
        <KpiCard title="活躍使用者" value={overviewData?.uniqueUsers || 0} icon="👤" />
        <KpiCard title="使用功能數" value={overviewData?.uniqueFeatures || 0} icon="🧩" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-secondary mb-4">API 呼叫趨勢</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-medium text-secondary mb-4">功能使用排行</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={featureData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={120} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {featureData.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm text-muted">{title}</p>
        <p className="text-2xl font-bold text-primary">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
