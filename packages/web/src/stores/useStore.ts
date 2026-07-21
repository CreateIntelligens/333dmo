import { create } from 'zustand';

interface AppState {
  tenantId: string;
  setTenantId: (id: string) => void;
  period: string;
  setPeriod: (p: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useStore = create<AppState>((set) => ({
  tenantId: 'develop',
  setTenantId: (id) => set({ tenantId: id }),
  period: '7d',
  setPeriod: (p) => set({ period: p }),
  theme: (localStorage.getItem('333dmo-theme') as 'dark' | 'light') || 'dark',
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('333dmo-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      document.documentElement.classList.toggle('light', next === 'light');
      return { theme: next };
    }),
}));
