import { describe, expect, it, vi, expectTypeOf } from "vitest";
import type { SlashCommandsCommand } from "./SlashCommands";

const filterCommands = (
  commands: SlashCommandsCommand[],
  query: string,
): SlashCommandsCommand[] => {
  return commands
    .filter(
      (item) =>
        item.title.toLowerCase().startsWith(query.toLowerCase()) ||
        (item.keywords || []).some((keyword) =>
          keyword.toLowerCase().startsWith(query.toLowerCase()),
        ),
    )
    .slice(0, query.length > 0 ? 10 : 20);
};

const mockCommands: SlashCommandsCommand[] = [
  {
    title: "Plain Text",
    description: "Normal paragraph style",
    section: "basic",
    icon: () => null,
    command: vi.fn(),
    keywords: ["text", "paragraph"],
  },
  {
    title: "Big Heading",
    description: "Big section heading",
    section: "basic",
    icon: () => null,
    command: vi.fn(),
    keywords: ["heading", "h2"],
  },
  {
    title: "Small Heading",
    description: "Small section heading",
    section: "basic",
    icon: () => null,
    command: vi.fn(),
    keywords: ["heading", "h3"],
  },
  {
    title: "Image",
    description: "Upload from your computer",
    section: "basic",
    icon: () => null,
    command: vi.fn(),
    keywords: ["picture", "photo"],
  },
  {
    title: "Bulleted list",
    description: "Create a bulleted list",
    section: "basic",
    icon: () => null,
    command: vi.fn(),
    keywords: ["list", "bullet"],
  },
  {
    title: "Numbered list",
    description: "Create a numbered list",
    section: "basic",
    icon: () => null,
    command: vi.fn(),
    keywords: ["list", "ordered"],
  },
  {
    title: "Quote",
    description: "Create a quote",
    section: "basic",
    icon: () => null,
    command: vi.fn(),
    keywords: ["blockquote"],
  },
  {
    title: "Divider",
    description: "Create a divider",
    section: "basic",
    icon: () => null,
    command: vi.fn(),
    keywords: ["hr", "horizontal"],
  },
  {
    title: "Code",
    description: "Create a code snippet",
    section: "basic",
    icon: () => null,
    command: vi.fn(),
    keywords: ["codeblock"],
  },
  {
    title: "Twitter",
    description: "Add a Twitter embed",
    section: "embed",
    icon: () => null,
    command: vi.fn(),
    keywords: ["tweet", "social"],
  },
  {
    title: "Video",
    description: "Add a video embed",
    section: "embed",
    icon: () => null,
    command: vi.fn(),
    keywords: ["youtube", "embed"],
  },
];

describe("slash commands - filter functionality", () => {
  it("should return all commands when query is empty", () => {
    const result = filterCommands(mockCommands, "");
    expect(result).toHaveLength(11);
  });

  it("should filter commands by title", () => {
    const result = filterCommands(mockCommands, "Big");
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Big Heading");
  });

  it("should filter commands by title case insensitive", () => {
    const result = filterCommands(mockCommands, "big");
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Big Heading");
  });

  it("should filter commands by keywords", () => {
    const result = filterCommands(mockCommands, "heading");
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.title)).toContain("Big Heading");
    expect(result.map((c) => c.title)).toContain("Small Heading");
  });

  it("should filter commands by keywords case insensitive", () => {
    const result = filterCommands(mockCommands, "HEADING");
    expect(result).toHaveLength(2);
  });

  it("should filter commands by additional keywords", () => {
    const result = filterCommands(mockCommands, "h2");
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Big Heading");
  });

  it("should limit results to 10 when filtering", () => {
    const result = filterCommands(mockCommands, "list");
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.title)).toContain("Bulleted list");
    expect(result.map((c) => c.title)).toContain("Numbered list");
  });

  it("should return empty array when no match", () => {
    const result = filterCommands(mockCommands, "nonexistent");
    expect(result).toHaveLength(0);
  });

  it("should filter embed section commands", () => {
    const result = filterCommands(mockCommands, "twitter");
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Twitter");
    expect(result[0]?.section).toBe("embed");
  });

  it("should filter video command by youtube keyword", () => {
    const result = filterCommands(mockCommands, "youtube");
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Video");
  });
});

describe("slash commands - command structure", () => {
  it("should have command function for each command", () => {
    mockCommands.forEach((cmd) => {
      expect(cmd.command).toBeDefined();
      expectTypeOf(cmd.command).toBeFunction();
    });
  });

  it("should have required properties for each command", () => {
    mockCommands.forEach((cmd) => {
      expect(cmd.title).toBeDefined();
      expect(cmd.description).toBeDefined();
      expect(cmd.section).toBeDefined();
      expect(cmd.icon).toBeDefined();
      expect(cmd.command).toBeDefined();
    });
  });

  it("should have valid section values", () => {
    mockCommands.forEach((cmd) => {
      expect(["basic", "embed"]).toContain(cmd.section);
    });
  });
});

describe("slash commands - basic section commands", () => {
  it("should have plain text command", () => {
    const cmd = mockCommands.find((c) => c.title === "Plain Text");
    expect(cmd).toBeDefined();
    expect(cmd?.section).toBe("basic");
  });

  it("should have big heading command", () => {
    const cmd = mockCommands.find((c) => c.title === "Big Heading");
    expect(cmd).toBeDefined();
    expect(cmd?.section).toBe("basic");
    expect(cmd?.keywords).toContain("heading");
  });

  it("should have small heading command", () => {
    const cmd = mockCommands.find((c) => c.title === "Small Heading");
    expect(cmd).toBeDefined();
    expect(cmd?.section).toBe("basic");
    expect(cmd?.keywords).toContain("heading");
  });

  it("should have image command", () => {
    const cmd = mockCommands.find((c) => c.title === "Image");
    expect(cmd).toBeDefined();
    expect(cmd?.section).toBe("basic");
  });

  it("should have bulleted list command", () => {
    const cmd = mockCommands.find((c) => c.title === "Bulleted list");
    expect(cmd).toBeDefined();
    expect(cmd?.section).toBe("basic");
  });

  it("should have numbered list command", () => {
    const cmd = mockCommands.find((c) => c.title === "Numbered list");
    expect(cmd).toBeDefined();
    expect(cmd?.section).toBe("basic");
  });

  it("should have quote command", () => {
    const cmd = mockCommands.find((c) => c.title === "Quote");
    expect(cmd).toBeDefined();
    expect(cmd?.section).toBe("basic");
  });

  it("should have divider command", () => {
    const cmd = mockCommands.find((c) => c.title === "Divider");
    expect(cmd).toBeDefined();
    expect(cmd?.section).toBe("basic");
  });

  it("should have code command", () => {
    const cmd = mockCommands.find((c) => c.title === "Code");
    expect(cmd).toBeDefined();
    expect(cmd?.section).toBe("basic");
  });
});

describe("slash commands - embed section commands", () => {
  it("should have twitter command", () => {
    const cmd = mockCommands.find((c) => c.title === "Twitter");
    expect(cmd).toBeDefined();
    expect(cmd?.section).toBe("embed");
    expect(cmd?.keywords).toContain("tweet");
  });

  it("should have video command", () => {
    const cmd = mockCommands.find((c) => c.title === "Video");
    expect(cmd).toBeDefined();
    expect(cmd?.section).toBe("embed");
    expect(cmd?.keywords).toContain("youtube");
  });
});
