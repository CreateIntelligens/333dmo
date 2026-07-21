import { useEffect, useState, useCallback } from 'react';
import { subscribeTenant, onActivityLog } from '../lib/socket';

export interface ActivityLog {
  id: string;
  tenantId: string;
  userId: string | null;
  permission: string | null;
  method: string;
  endpoint: string;
  statusCode: number | null;
  createdAt: string;
}

export function useRealtimeLogs(tenantId: string) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setLogs([]);

    const unsub = subscribeTenant(tenantId);

    const unsubLog = onActivityLog((log: ActivityLog) => {
      if (log.tenantId !== tenantId) {
        return;
      }

      setLogs((prev) => [log, ...prev].slice(0, 100)); // Keep last 100
    });

    setConnected(true);

    return () => {
      unsub();
      unsubLog();
      setConnected(false);
    };
  }, [tenantId]);

  const clearLogs = useCallback(() => setLogs([]), []);

  return { logs, connected, clearLogs };
}
