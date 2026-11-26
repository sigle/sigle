import { render, screen, waitFor } from "@testing-library/react";
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
  resolveImageUrl: vi.fn((url: string) => url),
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
    const sources: Array<unknown> = [];

    useEditorStore.getState().editor?.state.doc.descendants((node) => {
      if (node.type.name === "image") {
        sources.push(node.attrs.src);
      }
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

  const imageFile = () =>
    new File(["image"], "image.png", { type: "image/png" });

  /** Pastes in the editor, as the browser does. */
  const paste = (data: { file?: File; html?: string }) => {
    const clipboardData = new DataTransfer();

    if (data.file) {
      clipboardData.items.add(data.file);
    }

    if (data.html) {
      clipboardData.setData("text/html", data.html);
    }

    useEditorStore.getState().editor?.view.dom.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData,
        bubbles: true,
        cancelable: true,
      }),
    );
  };

  it("should upload a pasted image file on the pro plan", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap canUploadImages />
      </EditorFormProvider>,
    );

    await waitFor(() => {
      expect(useEditorStore.getState().editor).toBeDefined();
    });

    paste({ file: imageFile() });

    await waitFor(() => {
      expect(getImageSources()).toStrictEqual([
        "https://example.com/uploaded-image.png",
      ]);
    });
  });

  it("should offer pro for a pasted image file on the free plan", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );

    await waitFor(() => {
      expect(useEditorStore.getState().editor).toBeDefined();
    });

    // An image copied from a web page is pasted from its URL, as before.
    paste({
      file: imageFile(),
      html: '<img src="https://example.com/copied.png">',
    });
    const dialogAfterHtmlPaste = screen.queryByText("Upload images with Pro");

    paste({ file: imageFile() });

    expect({
      dialogAfterHtmlPaste,
      dialog: (await screen.findByText("Upload images with Pro")) !== null,
      sources: getImageSources(),
    }).toStrictEqual({
      dialogAfterHtmlPaste: null,
      dialog: true,
      sources: ["https://example.com/copied.png"],
    });
  });

  it("should upload a pasted image file whose html only holds data images", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap canUploadImages />
      </EditorFormProvider>,
    );

    await waitFor(() => {
      expect(useEditorStore.getState().editor).toBeDefined();
    });

    paste({
      file: imageFile(),
      html: '<meta charset="utf-8"><img src="data:image/png;base64,aW1hZ2U=">',
    });

    await waitFor(() => {
      expect(getImageSources()).toStrictEqual([
        "https://example.com/uploaded-image.png",
      ]);
    });
  });

  it("should keep the order of the files dropped inside text", async () => {
    // Called once per file, in the order of the files.
    vi.spyOn(URL, "createObjectURL")
      .mockReturnValueOnce("blob:a.png")
      .mockReturnValueOnce("blob:b.png");

    render(
      <EditorFormProvider post={{ ...defaultPost, content: "Hello world" }}>
        <EditorTipTap canUploadImages />
      </EditorFormProvider>,
    );

    await waitFor(() => {
      expect(useEditorStore.getState().editor).toBeDefined();
    });

    const view = useEditorStore.getState().editor?.view;
    // Happy DOM has no layout, so the drop lands after "Hello".
    vi.spyOn(view!, "posAtCoords").mockReturnValue({ pos: 6, inside: -1 });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(["a"], "a.png", { type: "image/png" }));
    dataTransfer.items.add(new File(["b"], "b.png", { type: "image/png" }));

    // Happy DOM ignores the `dataTransfer` of the event init.
    const drop = new DragEvent("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(drop, "dataTransfer", { value: dataTransfer });
    view?.dom.dispatchEvent(drop);

    expect(getImageSources()).toStrictEqual(["blob:a.png", "blob:b.png"]);
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
