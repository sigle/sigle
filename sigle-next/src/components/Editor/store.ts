import { create } from 'zustand';

interface EditorState {
  menuOpen: boolean;
  toggleMenu: (menuOpen: boolean) => void;
  story?: {
    title: string;
  };
  setStory: (story: { title: string }) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  menuOpen: false,
  toggleMenu: (menuOpen) => set(() => ({ menuOpen })),
  setStory: (story) => set(() => ({ story })),
}));
