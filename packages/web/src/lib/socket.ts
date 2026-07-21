import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let activeTenantId: string | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      path: '/ws',
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      if (activeTenantId) {
        socket?.emit('subscribe:tenant', activeTenantId);
      }
    });
  }
  return socket;
}

export function subscribeTenant(tenantId: string) {
  const s = getSocket();

   if (activeTenantId && activeTenantId !== tenantId) {
    s.emit('unsubscribe:tenant', activeTenantId);
  }

  activeTenantId = tenantId;
  s.emit('subscribe:tenant', tenantId);

  return () => {
    if (activeTenantId === tenantId) {
      s.emit('unsubscribe:tenant', tenantId);
      activeTenantId = null;
    }
  };
}

export function onActivityLog(callback: (log: any) => void) {
  const s = getSocket();
  s.on('activity:log', callback);
  return () => s.off('activity:log', callback);
}
