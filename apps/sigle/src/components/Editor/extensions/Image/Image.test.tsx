import { render } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { EditorFormProvider } from "../../EditorFormProvider";
import { EditorTipTap } from "../../EditorTiptap";
import { useEditorStore } from "../../store";

vi.mock("react-tweet", () => ({
  Tweet: () => null,
}));

vi.mock("@/lib/sigle", () => ({
  sigleApiClient: {
    useMutation: vi.fn(() => ({
      mutateAsync: vi
        .fn()
        .mockResolvedValue({ url: "https://example.com/uploaded-image.png" }),
    })),
  },
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ postId: "test-post-id" }),
}));

vi.mock("posthog-js/react", () => ({
  usePostHog: () => ({
    capture: vi.fn(),
  }),
}));

vi.mock("@/hooks/useWindowSize", () => ({
  useWindowSize: () => ({ width: 1024, height: 768 }),
}));

vi.mock("@/lib/images", () => ({
  resolveImageUrl: vi.fn((url) => url),
}));

const defaultPost = {
  type: "post" as const,
  title: "",
  content: "",
  coverImage: null,
  published: false,
  timestamp: 0,
};

describe("image extension - command availability", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useEditorStore.setState({ editor: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should have setImageFromFile command available", () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    vi.advanceTimersByTime(100);
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    expect(typeof editor?.commands.setImageFromFile).toBe("function");
  });
});
