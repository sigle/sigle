import type { Editor } from "@tiptap/core";
import { create } from "zustand";

interface EditorState {
  menuOpen: boolean | "meta";
  setMenuOpen: (menuOpen: boolean | "meta") => void;

  publishOpen: boolean;
  setPublishOpen: (menuOpen: boolean) => void;

  editor?: Editor;
  setEditor: (editor: Editor) => void;

  /** Whether a new cover image is uploading, publishing waits for it. */
  isCoverUploading: boolean;
  setIsCoverUploading: (isCoverUploading: boolean) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  menuOpen: false,
  setMenuOpen: (menuOpen) => set(() => ({ menuOpen })),

  publishOpen: false,
  setPublishOpen: (publishOpen) => set(() => ({ publishOpen })),

  editor: undefined,
  setEditor: (editor) => set(() => ({ editor })),

  isCoverUploading: false,
  setIsCoverUploading: (isCoverUploading) => set(() => ({ isCoverUploading })),
}));
