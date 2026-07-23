import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useStore } from '../stores/useStore';
import { getPermissionLabel } from '../lib/permissions';
import { formatTaipeiDateTime, formatTaipeiShortHour } from '../lib/date';
import { Icon, type IconName } from '../components/ui/Icon';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie, Legend, CartesianGrid
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
    time: formatTaipeiShortHour(item.timeBucket),
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

  // Prepare Peak Hours data as a 24-hour histogram in Taipei time
  const peakHoursData = (peakHours?.data || []).map((h: any) => ({
    hourLabel: `${String(h.hour).padStart(2, '0')}:00`,
    count: h.count,
  }));

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">LineOA Server / Overview</p>
          <h2 className="mt-1 text-balance text-2xl font-semibold text-primary">儀表板</h2>
          <p className="mt-1 max-w-2xl text-pretty text-sm text-secondary">掌握 API 使用量、活躍使用者與錯誤分布，快速找到值得關注的變化。</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-muted mono-value tabular-nums">
          <Icon name="clock-3" size={15} />
          <span>時區 Asia/Taipei · UTC+8</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="總 API 呼叫" value={overviewData?.totalRequests || 0} icon="activity" tone="accent" />
        <KpiCard title="活躍使用者" value={overviewData?.uniqueUsers || 0} icon="users" tone="green" />
        <KpiCard title="使用功能數" value={overviewData?.uniqueFeatures || 0} icon="wrench" tone="cyan" />
      </div>

      {/* Comparison Analysis */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="panel-heading">前一日 / 今日 對比</h3>
            <span className="hidden rounded-md px-3 py-1 text-xs font-medium md:inline-block" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
              今日 (00:00 - 現在) vs 昨日 (同時段)
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
            <h3 className="panel-heading">上週 / 本週 對比</h3>
            <span className="hidden rounded-md px-3 py-1 text-xs font-medium md:inline-block" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
              本週 (週一 - 現在) vs 上週 (同時段)
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* API call trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="panel-heading">API 呼叫趨勢</h3>
            <span className="text-xs text-muted mono-value">台北時間</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timelineData}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={40} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="API 呼叫" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours distribution */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="panel-heading">每日使用熱點時段</h3>
            <span className="text-xs text-muted mono-value">24H · UTC+8</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={peakHoursData} barCategoryGap="18%">
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="hourLabel" interval={2} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={36} />
              <Tooltip />
              <Bar dataKey="count" name="使用次數" fill="var(--accent)" radius={[2, 2, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Rankings & Features */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Features list */}
        <div className="card p-5">
          <h3 className="panel-heading mb-4">功能使用排行</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={featureData} layout="vertical">
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={140} />
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
          <h3 className="panel-heading mb-4">API 請求特徵分析</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Methods breakdown */}
            <div className="flex flex-col items-center">
              <span className="text-sm text-muted mb-2">HTTP 方法</span>
              {methodsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
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
                    <Legend verticalAlign="bottom" height={40} iconType="circle" iconSize={9} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted">無資料</div>
              )}
            </div>

            {/* Status breakdown */}
            <div className="flex flex-col items-center">
              <span className="text-sm text-muted mb-2">回應狀態碼</span>
              {statusCodesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
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
                    <Legend verticalAlign="bottom" height={40} iconType="circle" iconSize={9} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted">無資料</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Active Users details */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card overflow-hidden p-5">
          <h3 className="panel-heading mb-4">最活躍使用者排行</h3>
          <div className="overflow-x-auto">
            <table className="min-w-[32rem] w-full text-sm">
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
                      <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        {(user.userId || 'U').slice(0, 2).toUpperCase()}
                      </span>
                      {user.userId || '未登入/系統'}
                    </td>
                    <td className="py-3 font-bold mono-value" style={{ color: 'var(--accent)' }}>{user.count.toLocaleString()} 次</td>
                    <td className="py-3 text-right text-muted">
                      {formatTaipeiDateTime(user.lastActive)}
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

function KpiCard({ title, value, icon, tone }: { title: string; value: number; icon: IconName; tone: 'accent' | 'green' | 'cyan' }) {
  return (
    <div className="card flex items-center gap-4 p-5" style={{ borderLeft: `3px solid var(--${tone === 'cyan' ? 'cyan' : tone})` }}>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md" style={{ color: `var(--${tone === 'cyan' ? 'cyan' : tone})`, backgroundColor: `var(--${tone === 'cyan' ? 'accent' : tone}-soft)` }}>
        <Icon name={icon} size={22} />
      </div>
      <div>
        <p className="text-sm text-muted">{title}</p>
        <p className="text-3xl font-semibold text-primary mono-value tabular-nums">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function ComparisonMetric({ label, current = 0, previous = 0, change = 0 }: { label: string; current: number; previous: number; change: number }) {
  const isUp = change > 0;
  const isDown = change < 0;
  
  return (
    <div className="flex flex-col p-4 rounded-sm" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
      <span className="text-sm text-muted mb-1 block">{label}</span>
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className="text-xl font-bold text-primary mono-value tabular-nums">{current?.toLocaleString() ?? 0}</span>
        <span className="text-xs text-muted tabular-nums">/ {previous?.toLocaleString() ?? 0}</span>
      </div>
      <div className="mt-2 flex">
        {isUp && (
          <span className="text-xs font-semibold px-2 py-1 rounded flex items-center gap-0.5 bg-green-soft text-green">
            ↑ +{change}%
          </span>
        )}
        {isDown && (
          <span className="text-xs font-semibold px-2 py-1 rounded flex items-center gap-0.5 bg-red-soft text-red">
            ↓ {change}%
          </span>
        )}
        {!isUp && !isDown && (
          <span className="text-xs font-semibold px-2 py-1 rounded bg-tertiary text-muted" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            0%
          </span>
        )}
      </div>
    </div>
  );
}
