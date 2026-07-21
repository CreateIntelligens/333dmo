import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function MarqueeHeader() {
  const { data, isLoading } = useQuery({
    queryKey: ['marquee'],
    queryFn: () => api.getMarquee(),
    refetchInterval: 15000, // refresh every 15 seconds
  });

  const stations = data?.data || [];

  if (isLoading && !data) {
    return (
      <div 
        className="h-9 flex items-center justify-center text-xs text-muted border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        載入即時站台狀態中...
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div 
        className="h-9 flex items-center justify-center text-xs text-muted border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        ⚠️ 尚無任何站台活動數據
      </div>
    );
  }

  // Create two copies for seamless loop
  const marqueeItems = [...stations, ...stations];

  return (
    <div 
      className="h-9 relative w-full overflow-hidden border-b flex items-center select-none text-xs"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Live Badge */}
      <div 
        className="absolute left-0 top-0 bottom-0 px-3 font-bold flex items-center gap-1.5 z-10 border-r shadow-md backdrop-blur-md"
        style={{ 
          backgroundColor: 'var(--red-soft)', 
          color: 'var(--red)',
          borderColor: 'var(--border)'
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red animate-ping" style={{ backgroundColor: 'var(--red)' }} />
        <span>即時站台</span>
      </div>

      <div className="flex w-full overflow-hidden pl-24">
        <div className="animate-marquee flex items-center gap-12 py-1">
          {marqueeItems.map((station, index) => (
            <div key={index} className="flex items-center gap-6" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-bold" style={{ color: 'var(--accent)' }}>📍 {station.tenantId}</span>
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
    </div>
  );
}
