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
      <LiveTicker><span className="flex items-center gap-2"><Icon name="radio" size={15} /> 載入即時站台狀態中...</span></LiveTicker>
    );
  }

  if (stations.length === 0) {
    return (
      <LiveTicker><span className="flex items-center gap-2"><Icon name="radio" size={15} /> 尚無任何站台活動數據</span></LiveTicker>
    );
  }

  // Create two copies for seamless loop
  const marqueeItems = [...stations, ...stations];

  return (
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
