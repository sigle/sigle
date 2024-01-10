import { Editor } from '@tiptap/core';
import { create } from 'zustand';

interface EditorState {
  menuOpen: boolean;
  toggleMenu: (menuOpen: boolean) => void;

  publishOpen: boolean;
  togglePublish: (menuOpen: boolean) => void;

  editor?: Editor;
  setEditor: (editor: Editor) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  menuOpen: false,
  toggleMenu: (menuOpen) => set(() => ({ menuOpen })),

  publishOpen: false,
  togglePublish: (publishOpen) => set(() => ({ publishOpen })),

  editor: undefined,
  setEditor: (editor) => set(() => ({ editor })),
}));
