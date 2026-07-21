import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      path: '/ws',
      transports: ['websocket'],
    });
  }
  return socket;
}

export function subscribeTenant(tenantId: string) {
  const s = getSocket();
  s.emit('subscribe:tenant', tenantId);
  return () => s.emit('unsubscribe:tenant', tenantId);
}

export function onActivityLog(callback: (log: any) => void) {
  const s = getSocket();
  s.on('activity:log', callback);
  return () => s.off('activity:log', callback);
}
