import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../stores/useStore';
import { api } from '../../lib/api';
import { Icon, type IconName } from '../ui/Icon';

const navItems = [
  { to: '/', label: '儀表板', icon: 'layout-dashboard' as IconName },
  { to: '/activity', label: '即時活動', icon: 'activity' as IconName },
  { to: '/features', label: '功能使用', icon: 'wrench' as IconName },
  { to: '/users', label: '使用者活動', icon: 'users' as IconName },
];

const periods = [
  { value: '1d', label: '1天' },
  { value: '7d', label: '7天' },
  { value: '14d', label: '14天' },
  { value: '30d', label: '30天' },
  { value: '90d', label: '90天' },
];

export default function Sidebar() {
  const { tenantId, setTenantId, period, setPeriod, theme, toggleTheme } = useStore();
  const [tenants, setTenants] = useState<string[]>([]);

  useEffect(() => {
    api.getTenants().then((res) => setTenants(res.data || [])).catch(() => {});
  }, []);

  return (
    <aside
      className="w-64 flex flex-col shrink-0"
      style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--accent)', color: '#15171b' }}>
            <Icon name="bar-chart-3" size={19} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide text-primary">333dmo</h1>
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Usage monitor</p>
          </div>
          <button
            onClick={toggleTheme}
            className="ml-auto w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-tertiary"
            style={{ color: 'var(--text-secondary)' }}
            title={theme === 'dark' ? '切換淺色模式' : '切換深色模式'}
            aria-label={theme === 'dark' ? '切換淺色模式' : '切換深色模式'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          </button>
        </div>
      </div>

      {/* Tenant selector */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <label className="text-xs uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>資料來源</label>
        <select
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          className="w-full rounded-md px-2.5 py-2 text-sm outline-none transition-colors"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          {tenants.length > 0
            ? tenants.map((t) => <option key={t} value={t}>{t}</option>)
            : <option value={tenantId}>{tenantId}</option>
          }
        </select>
      </div>

      {/* Period selector */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>時間區間</label>
          <span className="text-xs mono-value" style={{ color: 'var(--accent)' }}>UTC+8</span>
        </div>
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="flex-1 px-1 py-1.5 rounded-md text-xs font-medium transition-all"
              style={
                period === p.value
                  ? { backgroundColor: 'var(--accent)', color: '#fff' }
                  : { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5" aria-label="主選單">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors mb-0.5"
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            })}
          >
            <Icon name={item.icon} size={16} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 text-xs flex items-center gap-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
        <span>WebSocket connected</span>
      </div>
    </aside>
  );
}
