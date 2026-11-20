import { render, waitFor } from "@testing-library/react";
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
  id: "test-id",
  title: "",
  content: "",
  metaTitle: null,
  metaDescription: null,
  coverImage: null,
  tags: [],
  canonicalUri: null,
  publishStatus: null,
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

describe("image extension - uploads by plan", () => {
  const gaiaImage = "https://gaia.blockstack.org/hub/abc/image.png";

  beforeEach(() => {
    useEditorStore.setState({ editor: undefined });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const getImageSources = () => {
    const sources: unknown[] = [];

    useEditorStore.getState().editor?.state.doc.descendants((node) => {
      if (node.type.name === "image") sources.push(node.attrs.src);
    });

    return sources;
  };

  it("should upload a file and use the returned url on the pro plan", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap canUploadImages />
      </EditorFormProvider>,
    );

    await waitFor(() => {
      expect(useEditorStore.getState().editor).toBeDefined();
    });

    const inserted = useEditorStore
      .getState()
      .editor?.commands.setImageFromFile({
        file: new File(["image"], "image.png", { type: "image/png" }),
      });

    expect(inserted).toBe(true);

    await waitFor(() => {
      expect(getImageSources()).toStrictEqual([
        "https://example.com/uploaded-image.png",
      ]);
    });
  });

  it("should not insert a file on the free plan", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );

    await waitFor(() => {
      expect(useEditorStore.getState().editor).toBeDefined();
    });

    const inserted = useEditorStore
      .getState()
      .editor?.commands.setImageFromFile({
        file: new File(["image"], "image.png", { type: "image/png" }),
      });

    expect({ inserted, sources: getImageSources() }).toStrictEqual({
      inserted: false,
      sources: [],
    });
  });

  it("should keep gaia images it cannot upload on the free plan", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <EditorFormProvider
        post={{ ...defaultPost, content: `![](${gaiaImage})` }}
      >
        <EditorTipTap />
      </EditorFormProvider>,
    );

    await waitFor(() => {
      expect(useEditorStore.getState().editor).toBeDefined();
    });

    expect({
      sources: getImageSources(),
      fetches: fetchMock.mock.calls.length,
    }).toStrictEqual({ sources: [gaiaImage], fetches: 0 });
  });
});
