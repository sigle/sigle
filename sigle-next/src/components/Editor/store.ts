import { create } from 'zustand';

interface EditorStory {
  id: string;
  title: string;
  content: string;
}

interface EditorState {
  menuOpen: boolean;
  toggleMenu: (menuOpen: boolean) => void;
  // Story from ComposeDB
  initialStory?: EditorStory;
  setInitialStory: (story: EditorStory) => void;
  // Local story to be edited
  story?: EditorStory;
  setStory: (story: Partial<EditorStory>) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  menuOpen: false,
  toggleMenu: (menuOpen) => set(() => ({ menuOpen })),
  setInitialStory: (story) =>
    set(() => ({
      initialStory: story,
      story,
    })),
  setStory: (story) =>
    set((state) => ({
      story: {
        ...state.story!,
        ...story,
      },
    })),
}));
