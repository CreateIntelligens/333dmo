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

  const { data: comparison } = useQuery({
    queryKey: ['comparison', tenantId],
    queryFn: () => api.getComparison(),
  });

  const overviewData = overview?.data;
  const comparisonData = comparison?.data;

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

      {/* Comparison Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-primary">前一日 / 今日 對比</h3>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
              今日 (00:00 - 現在) vs 昨日 (同時段)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ComparisonMetric 
              label="API 呼叫" 
              current={comparisonData?.daily?.today?.requests} 
              previous={comparisonData?.daily?.yesterday?.requests} 
              change={comparisonData?.daily?.change?.requests} 
            />
            <ComparisonMetric 
              label="活躍使用者" 
              current={comparisonData?.daily?.today?.users} 
              previous={comparisonData?.daily?.yesterday?.users} 
              change={comparisonData?.daily?.change?.users} 
            />
            <ComparisonMetric 
              label="使用功能數" 
              current={comparisonData?.daily?.today?.features} 
              previous={comparisonData?.daily?.yesterday?.features} 
              change={comparisonData?.daily?.change?.features} 
            />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-primary">上週 / 本週 對比</h3>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
              本週 (週一 - 現在) vs 上週 (同時段)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ComparisonMetric 
              label="API 呼叫" 
              current={comparisonData?.weekly?.thisWeek?.requests} 
              previous={comparisonData?.weekly?.lastWeek?.requests} 
              change={comparisonData?.weekly?.change?.requests} 
            />
            <ComparisonMetric 
              label="活躍使用者" 
              current={comparisonData?.weekly?.thisWeek?.users} 
              previous={comparisonData?.weekly?.lastWeek?.users} 
              change={comparisonData?.weekly?.change?.users} 
            />
            <ComparisonMetric 
              label="使用功能數" 
              current={comparisonData?.weekly?.thisWeek?.features} 
              previous={comparisonData?.weekly?.lastWeek?.features} 
              change={comparisonData?.weekly?.change?.features} 
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

function ComparisonMetric({ label, current = 0, previous = 0, change = 0 }: { label: string; current: number; previous: number; change: number }) {
  const isUp = change > 0;
  const isDown = change < 0;
  
  return (
    <div className="flex flex-col p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
      <span className="text-xs text-muted mb-1 block">{label}</span>
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className="text-base font-bold text-primary">{current?.toLocaleString() ?? 0}</span>
        <span className="text-[10px] text-muted">/ {previous?.toLocaleString() ?? 0}</span>
      </div>
      <div className="mt-2 flex">
        {isUp && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 bg-green-soft text-green">
            ↑ +{change}%
          </span>
        )}
        {isDown && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 bg-red-soft text-red">
            ↓ {change}%
          </span>
        )}
        {!isUp && !isDown && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-tertiary text-muted" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            0%
          </span>
        )}
      </div>
    </div>
  );
}
