import { MAX_UINT } from "@sigle/sdk";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { sigleClient } from "@/lib/sigle";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { createTestUser } from "@/test/helpers";
import { executeNewPostJob } from "./new-post";

vi.mock<typeof import("@/lib/consola")>(
  import("@/lib/consola"),
  () =>
    ({
      consola: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
      },
    }) as unknown as typeof import("@/lib/consola"),
);

const mockFetch = vi.spyOn(globalThis, "fetch");

describe(executeNewPostJob, () => {
  let testDb: TestDatabase | undefined = undefined;
  const userId = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  beforeEach(async () => {
    if (testDb) {
      await testDb.cleanup();
    }
    vi.clearAllMocks();
  });

  afterAll(async () => {
    mockFetch.mockRestore();
    if (testDb) {
      await testDb.close();
    }
  });

  it("creates a new post and creates its initial PostRevision", async () => {
    await createTestUser({ id: userId });

    const baseTokenUri = "ar://tx-metadata-id";
    const postId = "post-123";
    const txId = "tx-456";

    const { contract } = sigleClient.generatePostContract({
      metadata: baseTokenUri,
      collectInfo: {
        amount: 1000n,
        maxSupply: BigInt(MAX_UINT),
      },
    });

    const mockPostMetadata = {
      $schema: "https://json-schemas.sigle.io/posts/1.0.0.json",
      content: {
        id: postId,
        title: "New Post Title",
        content: "New Post Content",
        tags: ["news"],
        attributes: [{ key: "excerpt", value: "Excerpt", type: "String" }],
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPostMetadata,
    } as Response);

    await executeNewPostJob({
      address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.post-123",
      txId,
      blockHeight: 120,
      version: "1.0.0",
      contract,
      sender: userId,
      createdAt: new Date("2026-01-01"),
      isStreamingBlocks: false,
    });

    const post = await testDb?.db.post.findUnique({
      where: { id: postId },
    });
    expect(post).toMatchObject({
      id: postId,
      txId,
      title: "New Post Title",
    });

    const revisions = await testDb?.db.postRevision.findMany({
      where: { postId },
    });
    expect(revisions).toHaveLength(1);
    expect(revisions?.[0]).toMatchObject({
      postId,
      txId,
    });
  });
});
