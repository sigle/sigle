import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vite-plus/test";
import { EditorFormProvider } from "../EditorFormProvider";
import { EditorTipTap } from "../EditorTiptap";
import { useEditorStore } from "../store";
import { EditorSave } from "./EditorSave";

const { mutate } = vi.hoisted(() => ({
  mutate: vi.fn(
    (_vars: never, options?: { onError?: (error: Error) => void }) =>
      options?.onError?.(new Error("offline")),
  ),
}));

vi.mock(import("react-tweet"), () => ({
  Tweet: () => null,
}));

vi.mock(import("@/lib/sigle"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    sigleApiClient: {
      ...actual.sigleApiClient,
      useMutation: vi.fn().mockReturnValue({ mutate }),
    },
  };
});

vi.mock(import("next/navigation"), () => ({
  useParams: vi.fn().mockReturnValue({ postId: "test-post-id" }),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

vi.mock(import("posthog-js/react"), () => ({
  usePostHog: vi.fn().mockReturnValue({
    capture: vi.fn(),
  }),
}));

vi.mock(import("@/hooks/useWindowSize"), () => ({
  useWindowSize: () => ({ width: 1024, height: 768 }),
}));

vi.mock(import("../BubbleMenu"), () => ({
  EditorBubbleMenu: vi.fn().mockReturnValue(null),
}));

vi.mock(import("../FloatingMenu"), () => ({
  EditorFloatingMenu: vi.fn().mockReturnValue(null),
}));

vi.mock(import("../BottomInfo"), () => ({
  EditorBottomInfo: vi.fn().mockReturnValue(null),
}));

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

describe("editor save - leave guard", () => {
  beforeEach(() => {
    mutate.mockClear();
    useEditorStore.setState({ editor: undefined });
  });

  it("keeps asking before leaving after a failed save, and retries it", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
        <EditorSave />
      </EditorFormProvider>,
    );

    await waitFor(() => {
      expect(useEditorStore.getState().editor).toBeDefined();
    });

    useEditorStore.getState().editor?.commands.insertContent("Hello");

    await waitFor(
      () => {
        expect(mutate).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 },
    );

    await expect(screen.findByRole("alert")).resolves.toHaveTextContent(
      "offline",
    );

    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(mutate).toHaveBeenCalledTimes(2);
  }, 10_000);
});
