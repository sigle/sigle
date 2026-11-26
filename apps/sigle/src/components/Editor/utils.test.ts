import { PostMetadataSchema } from "@sigle/sdk";
import { describe, expect, it } from "vite-plus/test";
import { generateSigleMetadataFromForm } from "./utils";

// SAFETY: only getText is read
const editor = { getText: () => "word ".repeat(200) } as never;

const post = {
  type: "draft" as const,
  title: "My title",
  content: "Hello **world**",
  metaTitle: "Meta title",
  metaDescription: "Meta description",
  canonicalUri: "https://example.com/original",
  tags: ["web3"],
  contentWarning: "nsfw" as const,
};

const build = (overrides: Partial<typeof post> = {}) =>
  generateSigleMetadataFromForm({
    editor,
    postId: "draft-1",
    post: { ...post, ...overrides },
  });

describe(generateSigleMetadataFromForm, () => {
  it("builds metadata the SDK schema accepts", async () => {
    const result = await build();

    expect(() => PostMetadataSchema.parse(result)).not.toThrow();
    expect(result.content.id).toBe("draft-1");
  });

  it("writes the attribute keys the server reads", async () => {
    const result = await build();

    // These literals are read by the server's jobs/publish-draft.ts and are
    // part of signed, permanent data.
    expect(result.content.attributes?.map((a) => a.key)).toStrictEqual([
      "meta-title",
      "meta-description",
      "canonical-uri",
    ]);
  });

  it("limits the excerpt to 350 characters", async () => {
    const result = await build();

    expect(result.content.excerpt).toHaveLength(350);
  });

  it("is already in the form the server verifies", async () => {
    const result = await build();
    const { signature: _, ...unsigned } = result;

    // The server verifies the zod-parsed object, so the bytes the wallet
    // signs must survive a re-parse unchanged.
    expect(
      JSON.stringify(
        PostMetadataSchema.parse(JSON.parse(JSON.stringify(unsigned))),
      ),
    ).toBe(JSON.stringify(unsigned));
  });

  it("leaves attributes and tags out when empty", async () => {
    const result = await build({
      metaTitle: undefined,
      metaDescription: undefined,
      canonicalUri: undefined,
      tags: [],
    });

    // zod keeps the keys with `undefined` values; the signed JSON drops them.
    const signedContent = JSON.parse(JSON.stringify(result.content));

    expect(result.content.attributes).toBeUndefined();
    expect(result.content.tags).toBeUndefined();
    expect("attributes" in signedContent).toBe(false);
    expect("tags" in signedContent).toBe(false);
  });
});
