import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useStore } from '../stores/useStore';
import { getPermissionLabel } from '../lib/permissions';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, AreaChart, Area, PieChart, Pie, Legend 
} from 'recharts';

const COLORS = ['#7aa2f7', '#bb9af7', '#7dcfff', '#e0af68', '#9ece6a', '#f7768e', '#ff9e64', '#73daca'];

// Color mapping for HTTP Methods
const METHOD_COLORS: Record<string, string> = {
  GET: '#9ece6a',    // var(--green)
  POST: '#e0af68',   // var(--yellow)
  PUT: '#7aa2f7',    // var(--accent)
  PATCH: '#bb9af7',  // var(--purple)
  DELETE: '#f7768e', // var(--red)
};

// Color mapping for Status Codes
const STATUS_COLORS: Record<string, string> = {
  '2xx Success': '#9ece6a',      // var(--green)
  '3xx Redirect': '#7dcfff',     // var(--cyan)
  '4xx Client Error': '#e0af68',  // var(--yellow)
  '5xx Server Error': '#f7768e',  // var(--red)
};

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

  const { data: methods } = useQuery({
    queryKey: ['methods', tenantId, period],
    queryFn: () => api.getMethods(period),
  });

  const { data: statusCodes } = useQuery({
    queryKey: ['statusCodes', tenantId, period],
    queryFn: () => api.getStatusCodes(period),
  });

  const { data: peakHours } = useQuery({
    queryKey: ['peakHours', tenantId, period],
    queryFn: () => api.getPeakHours(period),
  });

  const { data: users } = useQuery({
    queryKey: ['users', tenantId, period],
    queryFn: () => api.getUsers(period),
  });

  const overviewData = overview?.data;
  const comparisonData = comparison?.data;
  const usersData = users?.data || [];

  const featureData = (features?.data || []).map((f: any) => ({
    ...f,
    label: getPermissionLabel(f.permission),
  }));

  const timelineData = (timeline?.data || []).map((item: any) => ({
    time: new Date(item.timeBucket).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit' }),
    count: item.count,
  }));

  // Prepare HTTP Methods data for Pie chart
  const methodsData = (methods?.data || []).map((m: any) => ({
    name: m.method,
    value: m.count,
    color: METHOD_COLORS[m.method] || '#565f89',
  }));

  // Prepare Status Codes data for Pie chart
  const statusCodesData = (statusCodes?.data || []).map((sc: any) => ({
    name: sc.statusGroup,
    value: sc.count,
    color: STATUS_COLORS[sc.statusGroup] || '#565f89',
  }));

  // Prepare Peak Hours data for Area chart
  const peakHoursData = (peakHours?.data || []).map((h: any) => ({
    hourLabel: `${h.hour}h`,
    count: h.count,
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

      {/* Row 3: Main Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API call trend */}
        <div className="card p-5 lg:col-span-2">
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

        {/* Peak Hours distribution */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-secondary mb-4">每日使用熱點時段</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={peakHoursData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="hourLabel" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Rankings & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Features list */}
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

        {/* HTTP Methods & Status Codes Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-secondary mb-4">API 請求特徵分析</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Methods breakdown */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted mb-2">HTTP 方法</span>
              {methodsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={methodsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {methodsData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[190px] flex items-center justify-center text-xs text-muted">無資料</div>
              )}
            </div>

            {/* Status breakdown */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted mb-2">回應狀態碼</span>
              {statusCodesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={statusCodesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusCodesData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[190px] flex items-center justify-center text-xs text-muted">無資料</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Active Users details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">最活躍使用者排行</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted border-b border-themed text-left">
                  <th className="pb-2">使用者 ID</th>
                  <th className="pb-2">調用次數</th>
                  <th className="pb-2 text-right">最後活躍時間</th>
                </tr>
              </thead>
              <tbody>
                {usersData.slice(0, 5).map((user: any, index: number) => (
                  <tr key={user.userId || index} className="border-b border-themed last:border-0 hover:bg-secondary/30 transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-2.5 font-medium text-primary flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        {(user.userId || 'U').slice(0, 2).toUpperCase()}
                      </span>
                      {user.userId || '未登入/系統'}
                    </td>
                    <td className="py-2.5 font-bold" style={{ color: 'var(--accent)' }}>{user.count.toLocaleString()} 次</td>
                    <td className="py-2.5 text-right text-muted">
                      {new Date(user.lastActive).toLocaleString('zh-TW')}
                    </td>
                  </tr>
                ))}
                {usersData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted">目前無活躍使用者資料</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
