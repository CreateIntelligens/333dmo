import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '儀表板', icon: '📊' },
  { to: '/activity', label: '即時活動', icon: '⚡' },
  { to: '/features', label: '功能使用', icon: '🔧' },
  { to: '/users', label: '使用者活動', icon: '👥' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">333dmo</h1>
        <p className="text-xs text-slate-400">B2B 使用監控</p>
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
