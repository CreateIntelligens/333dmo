import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../stores/useStore';
import { api } from '../../lib/api';

const navItems = [
  { to: '/', label: '儀表板', icon: '📊' },
  { to: '/activity', label: '即時活動', icon: '⚡' },
  { to: '/features', label: '功能使用', icon: '🔧' },
  { to: '/users', label: '使用者活動', icon: '👥' },
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
      className="w-60 flex flex-col shrink-0"
      style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--accent)' }}>333dmo</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>B2B 使用監控</p>
          </div>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            title={theme === 'dark' ? '切換淺色模式' : '切換深色模式'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Tenant selector */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>客戶</label>
        <select
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none transition-colors"
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
        <label className="text-xs block mb-1.5" style={{ color: 'var(--text-muted)' }}>時間區間</label>
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="flex-1 px-1 py-1 rounded-md text-xs font-medium transition-all"
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
      <nav className="flex-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5"
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            })}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        WebSocket: <span style={{ color: 'var(--green)' }}>●</span> Connected
      </div>
    </aside>
  );
}
