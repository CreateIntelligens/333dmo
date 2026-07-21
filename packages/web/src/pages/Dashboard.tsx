import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useStore } from '../stores/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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
  const featureData = features?.data || [];
  const timelineData = (timeline?.data || []).map((item: any) => ({
    time: new Date(item.timeBucket).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit' }),
    count: item.count,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">儀表板</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard title="總 API 呼叫" value={overviewData?.totalRequests || 0} icon="📡" />
        <KpiCard title="活躍使用者" value={overviewData?.uniqueUsers || 0} icon="👤" />
        <KpiCard title="使用功能數" value={overviewData?.uniqueFeatures || 0} icon="🧩" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-4">API 呼叫趨勢</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Usage */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-4">功能使用排行</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={featureData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="permission" tick={{ fontSize: 11, fill: '#94a3b8' }} width={140} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
