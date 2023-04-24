import { create } from 'zustand';

interface DashboardState {
  collapsed: boolean;
  toggleCollapse: (collapsed: boolean) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  collapsed: false,
  toggleCollapse: (collapsed) => set(() => ({ collapsed })),
  open: false,
  setOpen: (open) => set(() => ({ open })),
}));
