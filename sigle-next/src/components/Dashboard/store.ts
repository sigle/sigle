import { create } from 'zustand';

interface DashboardState {
  collapsed: boolean;
  toggleCollapse: (collapsed: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  collapsed: false,
  toggleCollapse: (collapsed) => set(() => ({ collapsed })),
}));
