import { create } from 'zustand';

interface EditorState {
  menuOpen: boolean;
  toggleMenu: (menuOpen: boolean) => void;

  publishOpen: boolean;
  togglePublish: (menuOpen: boolean) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  menuOpen: false,
  toggleMenu: (menuOpen) => set(() => ({ menuOpen })),

  publishOpen: false,
  togglePublish: (publishOpen) => set(() => ({ publishOpen })),
}));
