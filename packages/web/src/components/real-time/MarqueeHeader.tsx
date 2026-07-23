import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Icon } from '../ui/Icon';

export default function MarqueeHeader() {
  const { data, isLoading } = useQuery({
    queryKey: ['marquee'],
    queryFn: () => api.getMarquee(),
    refetchInterval: 15000, // refresh every 15 seconds
  });

  const stations = data?.data || [];

  if (isLoading && !data) {
    return (
      <>
        <DashboardToolbar />
        <LiveTicker><span className="flex items-center gap-2"><Icon name="radio" size={15} /> 載入即時站台狀態中...</span></LiveTicker>
      </>
    );
  }

  if (stations.length === 0) {
    return (
      <>
        <DashboardToolbar />
        <LiveTicker><span className="flex items-center gap-2"><Icon name="radio" size={15} /> 尚無任何站台活動數據</span></LiveTicker>
      </>
    );
  }

  // Create two copies for seamless loop
  const marqueeItems = [...stations, ...stations];

  return (
    <>
      <DashboardToolbar />
      <LiveTicker>
      {/* Live Badge */}
      <div 
        className="absolute left-0 top-0 bottom-0 px-4 font-bold flex items-center gap-2 z-10 border-r shadow-md backdrop-blur-md text-sm"
        style={{ 
          backgroundColor: 'var(--red-soft)', 
          color: 'var(--red)',
          borderColor: 'var(--border)'
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red animate-ping" style={{ backgroundColor: 'var(--red)' }} />
        <span className="tracking-wide">LIVE</span>
      </div>

      <div className="flex w-full overflow-hidden pl-24">
        <div className="animate-marquee flex items-center gap-14 py-1">
          {marqueeItems.map((station, index) => (
            <div key={index} className="flex items-center gap-7" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-bold" style={{ color: 'var(--accent)' }}><Icon name="radio" size={12} className="inline mr-1" />{station.tenantId}</span>
              <span className="flex items-center gap-1">
                <span 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ 
                    backgroundColor: station.onlineUsers > 0 ? 'var(--green)' : 'var(--text-muted)',
                    boxShadow: station.onlineUsers > 0 ? '0 0 4px var(--green)' : 'none'
                  }} 
                />
                線上人數: <strong style={{ color: station.onlineUsers > 0 ? 'var(--green)' : 'var(--text-muted)' }}>{station.onlineUsers}</strong>
              </span>
              <span>
                24H API 總計: <strong style={{ color: 'var(--text-primary)' }}>{station.apiCount24h.toLocaleString()}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
      </LiveTicker>
    </>
  );
}

function DashboardToolbar() {
  return (
    <header className="grafana-toolbar flex items-center justify-between gap-4 px-4 lg:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm" style={{ backgroundColor: 'var(--accent)', color: '#111217' }}>
          <Icon name="bar-chart-3" size={19} strokeWidth={2.2} />
        </div>
        <span className="hidden text-sm font-semibold text-secondary md:inline">Dashboards</span>
        <span className="hidden text-lg text-muted md:inline">›</span>
        <span className="truncate text-base font-semibold text-primary">LineOA Server</span>
        <span className="text-lg" style={{ color: 'var(--accent)' }} aria-label="已收藏">★</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button type="button" className="grafana-toolbar-button hidden items-center gap-2 lg:flex" aria-label="選擇時間區間">
          <Icon name="clock-3" size={15} />
          <span>Last 7 days</span>
          <Icon name="chevron-down" size={14} />
        </button>
        <button type="button" className="grafana-toolbar-button hidden items-center gap-2 sm:flex" aria-label="重新整理">
          <Icon name="refresh-cw" size={15} />
          <span>Refresh 15s</span>
        </button>
        <button type="button" className="grafana-toolbar-button accent hidden items-center gap-2 md:flex">
          <Icon name="radio" size={15} />
          <span>Share</span>
        </button>
        <button type="button" className="grafana-toolbar-button flex items-center gap-2">
          <Icon name="wrench" size={15} />
          <span>Edit</span>
        </button>
      </div>
    </header>
  );
}

function LiveTicker({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex h-10 w-full items-center overflow-hidden border-b select-none text-sm"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {children}
    </div>
  );
}
