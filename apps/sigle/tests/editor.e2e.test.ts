import { test, expect } from "@playwright/test";

test.describe("editor - basic text entry", () => {
  test("should type text and display in editor", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Hello World");
    await expect(editor).toContainText("Hello World");
  });

  test("should preserve typed content", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("First line");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Second line");
    await expect(editor).toContainText("First line");
    await expect(editor).toContainText("Second line");
  });
});

test.describe("editor - bold formatting", () => {
  test("should apply bold via keyboard shortcut", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Hello World");
    await page.keyboard.press("ArrowLeft", { times: 5 });
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowLeft", { times: 5 });
    await page.keyboard.up("SHIFT");
    await page.keyboard.down("ControlOrMeta");
    await page.keyboard.press("b");
    await page.keyboard.up("ControlOrMeta");
    await expect(editor.locator("strong")).toContainText("Hello");
  });

  test("should export bold as **text** in markdown", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Hello World");
    await page.keyboard.press("ArrowLeft", { times: 5 });
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowLeft", { times: 5 });
    await page.keyboard.up("SHIFT");
    await page.keyboard.down("ControlOrMeta");
    await page.keyboard.press("b");
    await page.keyboard.up("ControlOrMeta");

    const contentField = page.locator('textarea[name="content"]');
    await expect(contentField).toContainValue("**Hello** World");
  });
});

test.describe("editor - italic formatting", () => {
  test("should apply italic via keyboard shortcut", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Hello World");
    await page.keyboard.press("ArrowLeft", { times: 5 });
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowLeft", { times: 5 });
    await page.keyboard.up("SHIFT");
    await page.keyboard.down("ControlOrMeta");
    await page.keyboard.press("i");
    await page.keyboard.up("ControlOrMeta");
    await expect(editor.locator("em")).toContainText("Hello");
  });

  test("should export italic as *text* in markdown", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Hello World");
    await page.keyboard.press("ArrowLeft", { times: 5 });
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowLeft", { times: 5 });
    await page.keyboard.up("SHIFT");
    await page.keyboard.down("ControlOrMeta");
    await page.keyboard.press("i");
    await page.keyboard.up("ControlOrMeta");

    const contentField = page.locator('textarea[name="content"]');
    await expect(contentField).toContainValue("*Hello* World");
  });
});

test.describe("editor - inline code formatting", () => {
  test("should apply inline code via keyboard shortcut", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("const x = 1");
    await page.keyboard.press("ArrowLeft", { times: 6 });
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowLeft", { times: 6 });
    await page.keyboard.up("SHIFT");
    await page.keyboard.down("ControlOrMeta");
    await page.keyboard.press("e");
    await page.keyboard.up("ControlOrMeta");
    await expect(editor.locator("code")).toContainText("const x");
  });
});

test.describe("editor - slash command menu", () => {
  test("should open menu on typing /", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("/");
    const menu = page.locator('[class*="slash-command"]');
    await expect(menu).toBeVisible();
  });

  test("should filter commands when typing", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("/hea");
    const menu = page.locator('[class*="slash-command"]');
    await expect(menu).toBeVisible();
    await expect(menu).toContainText("Big Heading");
    await expect(menu).toContainText("Small Heading");
  });

  test("should close menu on escape", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("/");
    const menu = page.locator('[class*="slash-command"]');
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("should navigate menu with arrow keys", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("/");
    const menu = page.locator('[class*="slash-command"]');
    await expect(menu).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(menu).toBeHidden();
  });

  test("should apply big heading command", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("/");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.type("My Heading");

    const contentField = page.locator('textarea[name="content"]');
    await expect(contentField).toContainValue("## My Heading");
  });
});

test.describe("editor - headings", () => {
  test("should export h2 as ## heading", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Big Heading");
    await page.keyboard.press("ArrowLeft", { times: 11 });
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowLeft", { times: 11 });
    await page.keyboard.up("SHIFT");
    await page.keyboard.type("/");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    const contentField = page.locator('textarea[name="content"]');
    await expect(contentField).toContainValue("## Big Heading");
  });

  test("should export h3 as ### heading", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Small Heading");
    await page.keyboard.press("ArrowLeft", { times: 12 });
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowLeft", { times: 12 });
    await page.keyboard.up("SHIFT");
    await page.keyboard.type("/");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    const contentField = page.locator('textarea[name="content"]');
    await expect(contentField).toContainValue("### Small Heading");
  });
});

test.describe("editor - lists", () => {
  test("should create bulleted list", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Item 1");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Item 2");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.type("/");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    const contentField = page.locator('textarea[name="content"]');
    await expect(contentField).toContainValue("- Item 1");
    await expect(contentField).toContainValue("- Item 2");
  });

  test("should create numbered list", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("First item");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Second item");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.type("/");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    const contentField = page.locator('textarea[name="content"]');
    await expect(contentField).toContainValue("1. First item");
    await expect(contentField).toContainValue("2. Second item");
  });
});

test.describe("editor - blockquote", () => {
  test("should create blockquote", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("A famous quote");
    await page.keyboard.press("ArrowLeft", { times: 14 });
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowLeft", { times: 14 });
    await page.keyboard.up("SHIFT");
    await page.keyboard.type("/");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    const contentField = page.locator('textarea[name="content"]');
    await expect(contentField).toContainValue("> A famous quote");
  });
});

test.describe("editor - code block", () => {
  test("should create code block", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("const x = 1;");
    await page.keyboard.press("ArrowLeft", { times: 12 });
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowLeft", { times: 12 });
    await page.keyboard.up("SHIFT");
    await page.keyboard.type("/");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    const contentField = page.locator('textarea[name="content"]');
    await expect(contentField).toContainValue("```");
    await expect(contentField).toContainValue("const x = 1;");
  });
});

test.describe("editor - horizontal rule", () => {
  test("should create horizontal rule", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Before");
    await page.keyboard.press("Enter");
    await page.keyboard.type("/");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type("After");

    const contentField = page.locator('textarea[name="content"]');
    await expect(contentField).toContainValue("---");
  });
});

test.describe("editor - undo redo", () => {
  test("should support undo functionality", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Hello");
    await page.keyboard.press("ControlOrMeta+z");
    await expect(editor).toBeEmpty();
  });

  test("should support redo functionality", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Hello");
    await page.keyboard.press("ControlOrMeta+z");
    await page.keyboard.press("ControlOrMeta+Shift+z");
    await expect(editor).toContainText("Hello");
  });
});

test.describe("editor - character count", () => {
  test("should display character count", async ({ page }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();
    await page.keyboard.type("Hello World");
    const counter = page.locator('[class*="character-count"]');
    await expect(counter).toContainText("11");
  });
});

test.describe("editor - complete post flow", () => {
  test("should create complete post with multiple formatting types", async ({
    page,
  }) => {
    await page.goto("/new");
    const editor = page.locator(".tiptap");
    await editor.click();

    await page.keyboard.type("My Blog Post");
    await page.keyboard.press("ArrowLeft", { times: 13 });
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowLeft", { times: 13 });
    await page.keyboard.up("SHIFT");
    await page.keyboard.type("/");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    await page.keyboard.press("Enter");
    await page.keyboard.type(
      "This is a paragraph with **bold** and *italic* text.",
    );
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    await page.keyboard.type("A list:");
    await page.keyboard.press("Enter");
    await page.keyboard.type("First item");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Second item");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.type("/");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    const contentField = page.locator('textarea[name="content"]');
    const value = await contentField.inputValue();
    expect(value).toContain("# My Blog Post");
    expect(value).toContain("**bold**");
    expect(value).toContain("*italic*");
    expect(value).toContain("- First item");
    expect(value).toContain("- Second item");
  });
});
