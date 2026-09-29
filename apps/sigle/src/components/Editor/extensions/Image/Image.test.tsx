import { render } from "@testing-library/react";
import {
  describe,
  expect,
  it,
  beforeEach,
  vi,
  afterEach,
} from "vite-plus/test";
import { EditorFormProvider } from "../../EditorFormProvider";
import { EditorTipTap } from "../../EditorTiptap";
import { useEditorStore } from "../../store";

vi.mock(import("react-tweet"), () => ({
  Tweet: () => null,
}));

vi.mock(import("@/lib/sigle"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    sigleApiClient: {
      ...actual.sigleApiClient,
      useMutation: vi.fn().mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          url: "https://example.com/uploaded-image.png",
        }),
      }),
    },
  };
});

vi.mock(import("next/navigation"), () => ({
  useParams: vi.fn().mockReturnValue({ postId: "test-post-id" }),
}));

vi.mock(import("posthog-js/react"), () => ({
  usePostHog: vi.fn().mockReturnValue({
    capture: vi.fn(),
  }),
}));

vi.mock(import("@/hooks/useWindowSize"), () => ({
  useWindowSize: () => ({ width: 1024, height: 768 }),
}));

vi.mock(import("@/lib/images"), () => ({
  resolveImageUrl: vi.fn((url) => url),
}));

const defaultPost = {
  type: "draft" as const,
  title: "",
  content: "",
  coverImage: undefined,
  published: false,
  timestamp: 0,
  id: "test-id",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("image extension - command availability", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useEditorStore.setState({ editor: undefined });
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
    expect(editor?.commands.setImageFromFile).toBeDefined();
  });
});
