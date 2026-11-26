import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { EditorFormProvider } from "./EditorFormProvider";
import { useEditorStore } from "./store";

const defaultPost = {
  id: "test-id",
  title: "",
  content: "",
  metaTitle: null,
  metaDescription: null,
  coverImage: null,
  tags: [],
  canonicalUri: null,
  contentWarning: null,
  publishStatus: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe(EditorFormProvider, () => {
  it("resets the editor state when the draft is left", () => {
    const { unmount } = render(
      <EditorFormProvider post={defaultPost}>
        <div />
      </EditorFormProvider>,
    );

    useEditorStore.setState({ publishOpen: true, menuOpen: "meta" });

    unmount();

    expect(useEditorStore.getState()).toMatchObject({
      publishOpen: false,
      menuOpen: false,
    });
  });

  it("resets the editor state when switching to another draft", () => {
    const { rerender } = render(
      <EditorFormProvider post={defaultPost}>
        <div />
      </EditorFormProvider>,
    );

    useEditorStore.setState({ publishOpen: true });

    rerender(
      <EditorFormProvider post={{ ...defaultPost, id: "other-id" }}>
        <div />
      </EditorFormProvider>,
    );

    expect(useEditorStore.getState().publishOpen).toBe(false);
  });
});
