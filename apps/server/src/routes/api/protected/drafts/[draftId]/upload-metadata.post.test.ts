import type { H3Event } from "nitro/h3";
import { Result } from "better-result";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { arweaveUploadFile } from "@/lib/arweave";
import { verifyPostSignature } from "@/lib/metadata";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import {
  createTestDraft,
  createTestPost,
  createTestUser,
} from "@/test/helpers";

vi.mock<typeof import("nitro")>(import("nitro"), () => ({
  defineRouteMeta: vi.fn(),
}));

const mockGetRouterParam = vi.fn((event: unknown, name: string) => {
  if (name === "draftId") {
    return (event as { draftId?: string }).draftId ?? undefined;
  }
  return undefined;
});

const mockReadValidatedBodyZod = vi.fn();

vi.mock<typeof import("nitro/h3")>(import("nitro/h3"), async () => {
  const actual = await vi.importActual("nitro/h3");
  return {
    ...actual,
    getRouterParam: mockGetRouterParam,
  };
});

vi.mock<typeof import("@/lib/nitro")>(import("@/lib/nitro"), () => ({
  readValidatedBodyZod: (...args: unknown[]) =>
    mockReadValidatedBodyZod(...args),
}));

vi.mock<typeof import("@/lib/arweave")>(import("@/lib/arweave"), () => ({
  arweaveUploadFile: vi.fn(),
}));

vi.mock<typeof import("@/lib/metadata")>(import("@/lib/metadata"), () => ({
  verifyPostSignature: vi.fn(),
}));

vi.mock<typeof import("@/jobs/generate-image-blurhash")>(
  import("@/jobs/generate-image-blurhash"),
  () =>
    ({
      generateImageBlurhashJob: {
        emit: vi.fn(),
      },
    }) as unknown as typeof import("@/jobs/generate-image-blurhash"),
);

const { default: handler } = await import("./upload-metadata.post");

describe("api/protected/drafts/[draftId]/upload-metadata.post", () => {
  // oxlint-disable-next-line init-declarations
  let testDb: TestDatabase;
  const userId = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  beforeEach(async () => {
    await testDb.cleanup();
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await testDb.close();
  });

  it("publishes new draft and creates initial revision without Root-TX tag", async () => {
    const user = await createTestUser({ id: userId });
    await createTestDraft({
      id: "draft-1",
      userId: user.id,
      title: "New Draft",
    });

    mockGetRouterParam.mockReturnValue("draft-1");

    const mockMetadata = {
      $schema: "https://json-schemas.sigle.io/posts/1.0.0.json",
      content: {
        id: "draft-1",
        title: "New Draft Title",
        content: "Draft content",
        tags: ["tech"],
      },
    };

    mockReadValidatedBodyZod.mockResolvedValue({
      type: "draft",
      metadata: mockMetadata,
    });

    vi.mocked(verifyPostSignature).mockReturnValue(
      Result.ok({
        recoveredAddress: userId,
        publicKey: "pubkey-draft-1",
        signature: "sig-draft-1",
      }),
    );

    vi.mocked(arweaveUploadFile).mockResolvedValue(
      Result.ok({ id: "arweave-tx-draft" }),
    );

    const mockEvent = {
      context: {
        user: { id: userId },
        $posthog: { capture: vi.fn() },
      },
      path: "/api/protected/drafts/draft-1/upload-metadata",
      method: "POST",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toStrictEqual({
      id: "arweave-tx-draft",
      postId: "arweave-tx-draft",
      arweaveId: "arweave-tx-draft",
    });
    expect(arweaveUploadFile).toHaveBeenCalledWith(mockEvent, {
      metadata: mockMetadata,
      tags: [{ name: "Author", value: userId }],
    });

    const post = await testDb.db.post.findUnique({
      where: { id: "arweave-tx-draft" },
    });
    expect(post).toMatchObject({
      id: "arweave-tx-draft",
      txId: "arweave-tx-draft",
      title: "New Draft Title",
      revisionsCount: 1,
    });

    const revisions = await testDb.db.postRevision.findMany({
      where: { postId: "arweave-tx-draft" },
    });
    expect(revisions.map((r) => r.txId)).toStrictEqual(["arweave-tx-draft"]);
  });

  it("edits existing post, adds Root-TX tag, increments revisionsCount, and creates new PostRevision", async () => {
    const user = await createTestUser({ id: userId });
    const originalPost = await createTestPost({
      id: "original-post-id",
      txId: "original-post-id",
      userId: user.id,
      title: "Original Post",
      content: "Original content",
    });

    mockGetRouterParam.mockReturnValue(originalPost.id);

    const editedMetadata = {
      $schema: "https://json-schemas.sigle.io/posts/1.0.0.json",
      content: {
        id: originalPost.id,
        title: "Edited Post Title",
        content: "Edited content",
        tags: ["edited"],
      },
    };

    mockReadValidatedBodyZod.mockResolvedValue({
      type: "published",
      metadata: editedMetadata,
    });

    vi.mocked(verifyPostSignature).mockReturnValue(
      Result.ok({
        recoveredAddress: userId,
        publicKey: "pubkey-edit-1",
        signature: "sig-edit-1",
      }),
    );

    vi.mocked(arweaveUploadFile).mockResolvedValue(
      Result.ok({ id: "arweave-tx-edit-1" }),
    );

    const mockEvent = {
      context: {
        user: { id: userId },
        $posthog: { capture: vi.fn() },
      },
      path: `/api/protected/drafts/${originalPost.id}/upload-metadata`,
      method: "POST",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toStrictEqual({
      id: originalPost.id,
      postId: originalPost.id,
      arweaveId: "arweave-tx-edit-1",
    });

    // Verify Root-TX tag was included
    expect(arweaveUploadFile).toHaveBeenCalledWith(mockEvent, {
      metadata: editedMetadata,
      tags: [
        { name: "Author", value: userId },
        { name: "Root-TX", value: originalPost.id },
      ],
    });

    // Verify Post table was updated with new txId, title, content, and incremented revisionsCount
    const updatedPost = await testDb.db.post.findUnique({
      where: { id: originalPost.id },
    });
    expect(updatedPost).toMatchObject({
      id: originalPost.id,
      txId: "arweave-tx-edit-1",
      title: "Edited Post Title",
      content: "Edited content",
      revisionsCount: 2,
    });

    // Verify PostRevision entry was created
    const revisions = await testDb.db.postRevision.findMany({
      where: { postId: originalPost.id },
      orderBy: { createdAt: "asc" },
    });
    expect(revisions.map((r) => r.txId)).toStrictEqual([
      "original-post-id",
      "arweave-tx-edit-1",
    ]);
  });
});
