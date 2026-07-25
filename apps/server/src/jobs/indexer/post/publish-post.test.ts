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
import { getMetadataFromUri } from "@/lib/metadata";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { createTestUser } from "@/test/helpers";

vi.mock<typeof import("@/lib/metadata")>(
  import("@/lib/metadata"),
  () =>
    ({
      getMetadataFromUri: vi.fn(),
    }) as unknown as typeof import("@/lib/metadata"),
);

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

const { executePublishPostJob } = await import("./publish-post");

describe("executePublishPostJob", () => {
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
    if (testDb) {
      await testDb.close();
    }
  });

  it("publishes initial post and creates revision 1", async () => {
    await createTestUser({ id: userId });

    const mockGetMetadata = getMetadataFromUri as any;
    mockGetMetadata.mockResolvedValue(
      Result.ok({
        version: "v1",
        id: "tx-1",
        title: "Initial Post Title",
        content: "Initial Content",
        excerpt: "Initial",
        tags: ["tech"],
        recoveredAddress: userId,
        signature: "sig-1",
      }),
    );

    await executePublishPostJob({
      txId: "tx-1",
      blockHeight: 100,
      author: userId,
      uri: "ar://tx-1",
      createdAt: new Date("2026-01-01"),
    });

    const post = await testDb?.db.post.findUnique({
      where: { id: "tx-1" },
    });

    expect(post).toMatchObject({
      id: "tx-1",
      txId: "tx-1",
      title: "Initial Post Title",
      revisionsCount: 1,
    });

    const revisions = await testDb?.db.postRevision.findMany({
      where: { postId: "tx-1" },
    });
    expect(revisions).toHaveLength(1);
    expect(revisions?.[0]).toMatchObject({
      postId: "tx-1",
      txId: "tx-1",
    });
  });

  it("updates post metadata and increments revisionsCount when rootTxId is provided", async () => {
    await createTestUser({ id: userId });

    const mockGetMetadata = getMetadataFromUri as any;

    // Publish initial post
    mockGetMetadata.mockResolvedValueOnce(
      Result.ok({
        version: "v1",
        id: "tx-1",
        title: "Original Title",
        content: "Original Content",
        excerpt: "Original",
        tags: [],
        recoveredAddress: userId,
        signature: "sig-1",
      }),
    );

    await executePublishPostJob({
      txId: "tx-1",
      blockHeight: 100,
      author: userId,
      uri: "ar://tx-1",
      createdAt: new Date("2026-01-01"),
    });

    // Publish revision (edit)
    mockGetMetadata.mockResolvedValueOnce(
      Result.ok({
        version: "v1",
        id: "tx-2",
        title: "Updated Title",
        content: "Updated Content",
        excerpt: "Updated",
        tags: ["updated"],
        recoveredAddress: userId,
        signature: "sig-2",
      }),
    );

    await executePublishPostJob({
      txId: "tx-2",
      rootTxId: "tx-1",
      blockHeight: 105,
      author: userId,
      uri: "ar://tx-2",
      createdAt: new Date("2026-01-02"),
    });

    const post = await testDb?.db.post.findUnique({
      where: { id: "tx-1" },
    });

    expect(post).toMatchObject({
      id: "tx-1",
      txId: "tx-2",
      title: "Updated Title",
      content: "Updated Content",
      revisionsCount: 2,
    });

    const revisions = await testDb?.db.postRevision.findMany({
      where: { postId: "tx-1" },
      orderBy: { createdAt: "asc" },
    });

    expect(revisions).toHaveLength(2);
    expect(revisions?.[0].txId).toBe("tx-1");
    expect(revisions?.[1].txId).toBe("tx-2");
  });
});
