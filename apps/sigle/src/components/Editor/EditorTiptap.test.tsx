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
  return editor?.getMarkdown() ?? "";
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
    editor?.commands.setContent("Hello World", { contentType: "markdown" });
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
    editor?.commands.setContent("Hello World", { contentType: "markdown" });
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
    editor?.commands.setContent("Hello World", { contentType: "markdown" });
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
    editor?.commands.setContent("Hello World", { contentType: "markdown" });
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
    editor?.commands.setContent("const x = 1", { contentType: "markdown" });
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
    editor?.commands.setContent("Click here", { contentType: "markdown" });
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
    editor?.commands.setContent("My Heading", { contentType: "markdown" });
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
    editor?.commands.setContent("My Heading", { contentType: "markdown" });
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
    editor?.commands.setContent("A famous quote", { contentType: "markdown" });
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
    editor?.commands.setContent("Item 1", { contentType: "markdown" });
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
    editor?.commands.setContent("Item 1", { contentType: "markdown" });
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
    editor?.commands.setContent("const x = 1;", { contentType: "markdown" });
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
    expect(getMarkdownOutput()).toBe("---\n\n");
  });

  it("should export image as ![alt](url)", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.insertContent({
      type: "image",
      attrs: {
        src: "https://example.com/image.png",
        alt: "Test image",
      },
    });
    const output = getMarkdownOutput();
    expect(output).toContain("![Test image](https://example.com/image.png)");
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
    editor?.commands.setContent("**bold text**", { contentType: "markdown" });
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
    editor?.commands.setContent("*italic text*", { contentType: "markdown" });
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
    editor?.commands.setContent("## Heading 2", { contentType: "markdown" });
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
    editor?.commands.setContent("> This is a quote", {
      contentType: "markdown",
    });
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
    editor?.commands.setContent("- Item 1\n- Item 2", {
      contentType: "markdown",
    });
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
    editor?.commands.setContent("```\ncode here\n```", {
      contentType: "markdown",
    });
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
    editor?.commands.setContent("[Example](https://example.com)", {
      contentType: "markdown",
    });
    expect(editor?.getText()).toBe("Example");
    expect(editor?.isActive("link")).toBe(true);
  });

  it("should parse markdown strikethrough", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("~~strikethrough text~~", {
      contentType: "markdown",
    });
    expect(editor?.getText()).toBe("strikethrough text");
    expect(editor?.isActive("strike")).toBe(true);
  });

  it("should parse markdown inline code", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("`inline code`", { contentType: "markdown" });
    expect(editor?.getText()).toBe("inline code");
    expect(editor?.isActive("code")).toBe(true);
  });

  it("should parse markdown h3 heading", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("### Heading 3", { contentType: "markdown" });
    expect(editor?.getText()).toBe("Heading 3");
    expect(editor?.isActive("heading", { level: 3 })).toBe(true);
  });

  it("should parse markdown ordered list", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("1. First item\n2. Second item", {
      contentType: "markdown",
    });
    expect(editor?.getText()).toContain("First item");
    expect(editor?.getText()).toContain("Second item");
    expect(editor?.isActive("orderedList")).toBe(true);
  });

  it("should parse markdown horizontal rule", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("---", { contentType: "markdown" });
    const output = getMarkdownOutput();
    expect(output).toBe("---");
  });

  it("should parse markdown image", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent(
      "![Test image](https://example.com/image.png)",
      { contentType: "markdown" },
    );
    const output = getMarkdownOutput();
    expect(output).toContain("![Test image](https://example.com/image.png)");
  });
});

describe("editor tiptap - html deserialization", () => {
  beforeEach(() => {
    useEditorStore.setState({ editor: undefined });
  });

  it("should parse html bold", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("<strong>bold text</strong>", {
      contentType: "html",
    });
    expect(editor?.getText()).toBe("bold text");
    expect(editor?.isActive("bold")).toBe(true);
  });

  it("should parse html italic", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("<em>italic text</em>", {
      contentType: "html",
    });
    expect(editor?.getText()).toBe("italic text");
    expect(editor?.isActive("italic")).toBe(true);
  });

  it("should parse html strikethrough", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("<s>strikethrough text</s>", {
      contentType: "html",
    });
    expect(editor?.getText()).toBe("strikethrough text");
    expect(editor?.isActive("strike")).toBe(true);
  });

  it("should parse html inline code", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("<code>inline code</code>", {
      contentType: "html",
    });
    expect(editor?.getText()).toBe("inline code");
    expect(editor?.isActive("code")).toBe(true);
  });

  it("should parse html link", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent('<a href="https://example.com">Example</a>', {
      contentType: "html",
    });
    expect(editor?.getText()).toBe("Example");
    expect(editor?.isActive("link")).toBe(true);
  });

  it("should parse html h2 heading", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("<h2>Heading 2</h2>", { contentType: "html" });
    expect(editor?.getText()).toBe("Heading 2");
    expect(editor?.isActive("heading", { level: 2 })).toBe(true);
  });

  it("should parse html h3 heading", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("<h3>Heading 3</h3>", { contentType: "html" });
    expect(editor?.getText()).toBe("Heading 3");
    expect(editor?.isActive("heading", { level: 3 })).toBe(true);
  });

  it("should parse html blockquote", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("<blockquote>This is a quote</blockquote>", {
      contentType: "html",
    });
    expect(editor?.getText()).toContain("This is a quote");
    expect(editor?.isActive("blockquote")).toBe(true);
  });

  it("should parse html bullet list", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("<ul><li>Item 1</li><li>Item 2</li></ul>", {
      contentType: "html",
    });
    expect(editor?.getText()).toContain("Item 1");
    expect(editor?.getText()).toContain("Item 2");
    expect(editor?.isActive("bulletList")).toBe(true);
  });

  it("should parse html ordered list", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent(
      "<ol><li>First item</li><li>Second item</li></ol>",
      { contentType: "html" },
    );
    expect(editor?.getText()).toContain("First item");
    expect(editor?.getText()).toContain("Second item");
    expect(editor?.isActive("orderedList")).toBe(true);
  });

  it("should parse html code block", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("<pre><code>const x = 1;</code></pre>", {
      contentType: "html",
    });
    expect(editor?.getText()).toContain("const x = 1;");
    expect(editor?.isActive("codeBlock")).toBe(true);
  });

  it("should parse html horizontal rule", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent("<hr>", { contentType: "html" });
    const output = getMarkdownOutput();
    expect(output).toBe("---");
  });

  it("should parse html image", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.setContent(
      '<img src="https://example.com/image.png" alt="Test image">',
      { contentType: "html" },
    );
    const output = getMarkdownOutput();
    expect(output).toContain("![Test image](https://example.com/image.png)");
  });
});

describe("editor tiptap - embeds", () => {
  beforeEach(() => {
    useEditorStore.setState({ editor: undefined });
  });

  it("should export twitter embed as link", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.insertContent({
      type: "embed",
      attrs: {
        url: "https://twitter.com/user/status/1234567890",
        embedType: "twitter",
      },
    });
    const output = getMarkdownOutput();
    expect(output).toContain("https://twitter.com/user/status/1234567890");
  });

  it("should export youtube embed as link", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    editor?.commands.insertContent({
      type: "embed",
      attrs: {
        url: "https://youtube.com/watch?v=abc123",
        embedType: "video",
      },
    });
    const output = getMarkdownOutput();
    expect(output).toContain("https://youtube.com/watch?v=abc123");
  });

  it("should preserve twitter embed through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "https://twitter.com/user/status/1234567890\n\n";
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
    expect(exported).toBe(original);
  });

  it("should preserve youtube embed through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "https://youtube.com/watch?v=abc123\n\n";
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
    expect(exported).toBe(original);
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
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
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
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
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
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
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
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
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
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
    expect(exported).toContain("A quote");
  });

  it("should preserve strikethrough through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "~~strikethrough text~~";
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
    expect(exported).toBe(original);
  });

  it("should preserve inline code through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "`inline code`";
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
    expect(exported).toBe(original);
  });

  it("should preserve link through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "[Example](https://example.com)";
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
    expect(exported).toBe(original);
  });

  it("should preserve h3 heading through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "### Heading 3";
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
    expect(exported).toContain("### Heading 3");
  });

  it("should preserve ordered list through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "1. First item\n2. Second item";
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
    expect(exported).toContain("1. First item");
    expect(exported).toContain("2. Second item");
  });

  it("should preserve code block through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "```\nconst x = 1;\n```";
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
    expect(exported).toContain("```");
    expect(exported).toContain("const x = 1;");
  });

  it("should preserve horizontal rule through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "---\n\n";
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
    expect(exported).toBe("---\n\n");
  });

  it("should preserve image through round-trip", async () => {
    render(
      <EditorFormProvider post={defaultPost}>
        <EditorTipTap />
      </EditorFormProvider>,
    );
    await waitForEditor();
    const editor = useEditorStore.getState().editor;
    expect(editor).toBeDefined();
    const original = "![Test image](https://example.com/image.png)";
    editor?.commands.setContent(original, { contentType: "markdown" });
    const exported = editor?.getMarkdown();
    expect(exported).toBe(original);
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
    editor?.commands.setContent("Hello World", { contentType: "markdown" });
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
    editor?.commands.insertContent("Hello");
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
    editor?.commands.insertContent("Hello");
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
    editor?.commands.setContent("Test content", { contentType: "markdown" });
    expect(getMarkdownOutput()).toBe("Test content");
  });
});
