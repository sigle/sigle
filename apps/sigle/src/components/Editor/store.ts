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

  /**
   * The store outlives the editor page, so the page resets it when it leaves
   * a draft. Every data field must be in `initialState` to be reset.
   */
  reset: () => void;
}

const initialState = {
  menuOpen: false,
  publishOpen: false,
  editor: undefined,
  isCoverUploading: false,
} satisfies Partial<EditorState>;

export const useEditorStore = create<EditorState>()((set) => ({
  ...initialState,

  setMenuOpen: (menuOpen) => set(() => ({ menuOpen })),

  setPublishOpen: (publishOpen) => set(() => ({ publishOpen })),

  setEditor: (editor) => set(() => ({ editor })),

  setIsCoverUploading: (isCoverUploading) => set(() => ({ isCoverUploading })),

  reset: () => set(initialState),
}));
