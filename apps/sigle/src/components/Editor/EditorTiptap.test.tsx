import type * as nextNavigationModule from "next/navigation";
import type * as posthogModule from "posthog-js/react";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import type * as sigleModule from "@/lib/sigle";
import { EditorFormProvider } from "./EditorFormProvider";
import { EditorTipTap } from "./EditorTiptap";
import { useEditorStore } from "./store";

vi.mock(import("react-tweet"), () => ({
  Tweet: () => null,
}));

vi.mock(
  import("@/lib/sigle"),
  () =>
    ({
      sigleApiClient: {
        useMutation: vi.fn(() => ({
          mutateAsync: vi.fn(),
        })),
      },
    }) as unknown as Partial<typeof sigleModule>,
);

vi.mock(
  import("next/navigation"),
  () =>
    ({
      useParams: () => ({ postId: "test-post-id" }),
    }) as unknown as Partial<typeof nextNavigationModule>,
);

vi.mock(
  import("posthog-js/react"),
  () =>
    ({
      usePostHog: () => ({
        capture: vi.fn(),
      }),
    }) as unknown as Partial<typeof posthogModule>,
);

vi.mock(import("@/hooks/useWindowSize"), () => ({
  useWindowSize: () => ({ width: 1024, height: 768 }),
}));

vi.mock(import("./BubbleMenu"), () => ({
  EditorBubbleMenu: vi.fn().mockReturnValue(null),
}));

vi.mock(import("./FloatingMenu"), () => ({
  EditorFloatingMenu: vi.fn().mockReturnValue(null),
}));

vi.mock(import("./BottomInfo"), () => ({
  EditorBottomInfo: vi.fn().mockReturnValue(null),
}));

const getMarkdownOutput = (): string => {
  const store = useEditorStore.getState();
  const editor = store.editor;
  expect(editor).toBeDefined();
  return editor?.storage.markdown.getMarkdown() ?? "";
};

const waitForEditor = async () => {
  await waitFor(() => {
    expect(useEditorStore.getState().editor).not.toBeNull();
  });
};

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

describe("editor tiptap - markdown serialization", () => {
  beforeEach(() => {
    useEditorStore.setState({ editor: undefined });
  });

  it("should export empty string for empty editor", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    expect(getMarkdownOutput()).toBe("");
  });

  it("should export plain text correctly", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("Hello World");
    expect(getMarkdownOutput()).toBe("Hello World");
  });

  it("should export bold text as **text**", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("Hello World");
    editor?.chain().focus().selectAll().toggleBold().run();
    expect(getMarkdownOutput()).toBe("**Hello World**");
  });

  it("should export italic text as *text*", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("Hello World");
    editor?.chain().focus().selectAll().toggleItalic().run();
    expect(getMarkdownOutput()).toBe("*Hello World*");
  });

  it("should export strike-through text as ~~text~~", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("Hello World");
    editor?.chain().focus().selectAll().toggleStrike().run();
    expect(getMarkdownOutput()).toBe("~~Hello World~~");
  });

  it("should export inline code as `code`", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("const x = 1");
    editor?.chain().focus().selectAll().toggleCode().run();
    expect(getMarkdownOutput()).toBe("`const x = 1`");
  });

  it("should export link as [text](url)", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("Click here");
    editor
      ?.chain()
      .focus()
      .selectAll()
      .setLink({ href: "https://example.com" })
      .run();
    expect(getMarkdownOutput()).toBe("[Click here](https://example.com)");
  });

  it("should export h2 heading as ## heading", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("My Heading");
    editor?.chain().focus().selectAll().toggleHeading({ level: 2 }).run();
    expect(getMarkdownOutput()).toBe("## My Heading");
  });

  it("should export h3 heading as ### heading", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("My Heading");
    editor?.chain().focus().selectAll().toggleHeading({ level: 3 }).run();
    expect(getMarkdownOutput()).toBe("### My Heading");
  });

  it("should export blockquote as > quote", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("A famous quote");
    editor?.chain().focus().selectAll().toggleBlockquote().run();
    expect(getMarkdownOutput()).toBe("> A famous quote");
  });

  it("should export bullet list as - item", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("Item 1");
    editor?.chain().focus().toggleBulletList().run();
    expect(getMarkdownOutput()).toContain("- Item 1");
  });

  it("should export ordered list as 1. item", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("Item 1");
    editor?.chain().focus().toggleOrderedList().run();
    expect(getMarkdownOutput()).toContain("1. Item 1");
  });

  it("should export code block with proper syntax", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("const x = 1;");
    editor?.chain().focus().toggleCodeBlock().run();
    const output = getMarkdownOutput();
    expect(output).toContain("```");
    expect(output).toContain("const x = 1;");
  });

  it("should export horizontal rule as ---", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setHorizontalRule();
    expect(getMarkdownOutput()).toBe("---");
  });
});

describe("editor tiptap - markdown deserialization", () => {
  beforeEach(() => {
    useEditorStore.setState({ editor: undefined });
  });

  it("should parse markdown bold formatting", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("**bold text**");
    expect(editor?.getText()).toBe("bold text");
    expect(editor?.isActive("bold")).toBe(true);
  });

  it("should parse markdown italic formatting", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("*italic text*");
    expect(editor?.getText()).toBe("italic text");
    expect(editor?.isActive("italic")).toBe(true);
  });

  it("should parse markdown heading", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("## Heading 2");
    expect(editor?.getText()).toBe("Heading 2");
    expect(editor?.isActive("heading", { level: 2 })).toBe(true);
  });

  it("should parse markdown blockquote", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("> This is a quote");
    expect(editor?.getText()).toContain("This is a quote");
    expect(editor?.isActive("blockquote")).toBe(true);
  });

  it("should parse markdown list", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("- Item 1\n- Item 2");
    expect(editor?.getText()).toContain("Item 1");
    expect(editor?.getText()).toContain("Item 2");
    expect(editor?.isActive("bulletList")).toBe(true);
  });

  it("should parse markdown code block", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("```\ncode here\n```");
    expect(editor?.getText()).toBe("code here");
    expect(editor?.isActive("codeBlock")).toBe(true);
  });

  it("should parse markdown link", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("[Example](https://example.com)");
    expect(editor?.getText()).toBe("Example");
    expect(editor?.isActive("link")).toBe(true);
  });
});

describe("editor tiptap - round-trip", () => {
  beforeEach(() => {
    useEditorStore.setState({ editor: undefined });
  });

  it("should preserve bold formatting through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "**bold text**";
    editor?.commands.setContent(original);
    const exported = editor?.storage.markdown.getMarkdown();
    expect(exported).toBe(original);
  });

  it("should preserve text formatting through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "Some **bold** and *italic* text.";
    editor?.commands.setContent(original);
    const exported = editor?.storage.markdown.getMarkdown();
    expect(exported).toContain("**bold**");
    expect(exported).toContain("*italic*");
  });

  it("should preserve heading through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "## Heading";
    editor?.commands.setContent(original);
    const exported = editor?.storage.markdown.getMarkdown();
    expect(exported).toContain("## Heading");
  });

  it("should preserve list through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "- List item 1\n- List item 2";
    editor?.commands.setContent(original);
    const exported = editor?.storage.markdown.getMarkdown();
    expect(exported).toContain("List item 1");
    expect(exported).toContain("List item 2");
  });

  it("should preserve blockquote through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "> A quote";
    editor?.commands.setContent(original);
    const exported = editor?.storage.markdown.getMarkdown();
    expect(exported).toContain("A quote");
  });
});

describe("editor tiptap - editor state", () => {
  beforeEach(() => {
    useEditorStore.setState({ editor: undefined });
  });

  it("should update character count", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("Hello World");
    expect(editor?.storage.characterCount.characters()).toBe(11);
  });

  it("should support undo functionality", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("Hello");
    editor?.commands.undo();
    expect(editor?.getText()).toBe("");
  });

  it("should support redo functionality", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("Hello");
    editor?.commands.undo();
    editor?.commands.redo();
    expect(editor?.getText()).toBe("Hello");
  });
});

describe("editor tiptap - form integration", () => {
  beforeEach(() => {
    useEditorStore.setState({ editor: undefined });
  });

  it("should sync content to form on update", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("Test content");
    expect(getMarkdownOutput()).toBe("Test content");
  });
});
