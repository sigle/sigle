import { create } from 'zustand';

interface EditorState {
  menuOpen: boolean;
  toggleMenu: (menuOpen: boolean) => void;
}

export const useDashboardStore = create<EditorState>()((set) => ({
  menuOpen: false,
  toggleMenu: (menuOpen) => set(() => ({ menuOpen })),
}));
