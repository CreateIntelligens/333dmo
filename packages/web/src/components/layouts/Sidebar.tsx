import { NavLink } from 'react-router-dom';
import { useStore } from '../../stores/useStore';

const navItems = [
  { to: '/', label: '儀表板', icon: '📊' },
  { to: '/activity', label: '即時活動', icon: '⚡' },
  { to: '/features', label: '功能使用', icon: '🔧' },
  { to: '/users', label: '使用者活動', icon: '👥' },
];

const tenants = [
  { id: 'develop', label: 'Develop' },
  { id: 'tatung', label: 'Tatung 大同' },
  { id: 'fm-mart', label: 'FM-Mart 全聯' },
  { id: 'fanpokka', label: 'Fanpokka 凡立可' },
];

export default function Sidebar() {
  const { tenantId, setTenantId } = useStore();

  return (
    <aside className="w-60 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">333dmo</h1>
        <p className="text-xs text-slate-400">B2B 使用監控</p>
      </div>
      <div className="px-4 py-3 border-b border-slate-700">
        <label className="text-xs text-slate-400 block mb-1">客戶</label>
        <select
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        >
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-300 hover:bg-slate-700'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        WebSocket: <span className="text-green-400">●</span> Connected
      </div>
    </aside>
  );
}
