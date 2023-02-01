import { create } from 'zustand';

interface EditorStory {
  id: string;
  title: string;
  content: string;
}

interface EditorState {
  menuOpen: boolean;
  toggleMenu: (menuOpen: boolean) => void;
  story?: EditorStory;
  setStory: (story: Partial<EditorStory>) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  menuOpen: false,
  toggleMenu: (menuOpen) => set(() => ({ menuOpen })),
  setStory: (story) =>
    set((state) => ({
      story: {
        ...state.story!,
        ...story,
      },
    })),
}));
