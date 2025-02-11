import type { Editor } from "@tiptap/core";
import { create } from "zustand";

interface EditorState {
  menuOpen: boolean | "meta" | "collect";
  setMenuOpen: (menuOpen: boolean | "meta" | "collect") => void;

  publishOpen: boolean;
  setPublishOpen: (menuOpen: boolean) => void;

  editor?: Editor;
  setEditor: (editor: Editor) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  menuOpen: false,
  setMenuOpen: (menuOpen) => set(() => ({ menuOpen })),

  publishOpen: false,
  setPublishOpen: (publishOpen) => set(() => ({ publishOpen })),

  editor: undefined,
  setEditor: (editor) => set(() => ({ editor })),
}));
