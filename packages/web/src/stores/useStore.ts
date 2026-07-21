import { create } from 'zustand';

interface AppState {
  tenantId: string;
  setTenantId: (id: string) => void;
  period: string;
  setPeriod: (p: string) => void;
}

export const useStore = create<AppState>((set) => ({
  tenantId: 'family',
  setTenantId: (id) => set({ tenantId: id }),
  period: '7d',
  setPeriod: (p) => set({ period: p }),
}));
