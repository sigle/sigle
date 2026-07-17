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
import { createTestPost, createTestUser } from "@/test/helpers";

const mockEmit = vi.fn();

vi.mock<typeof import("../index")>(
  import("../index"),
  () =>
    ({
      indexerJob: {
        emit: (...args: unknown[]) => mockEmit(...args),
      },
    }) as unknown as typeof import("../index"),
);

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

const mockFetch = vi.spyOn(globalThis, "fetch");

const { executeIndexerIndexPostsJob } = await import("./index-posts");

describe("executeIndexerIndexPostsJob", () => {
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

  it("returns 0 posts when no Arweave transactions exist", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          transactions: {
            edges: [],
          },
        },
      }),
    } as Response);

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(0);
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it("processes new posts successfully", async () => {
    await createTestUser({ id: userId });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          transactions: {
            edges: [
              {
                node: {
                  id: "arweave-tx-1",
                  block: {
                    height: 12345,
                    timestamp: 1672531199,
                  },
                },
              },
            ],
          },
        },
      }),
    } as Response);

    const mockGetMetadata = getMetadataFromUri as any;
    mockGetMetadata.mockResolvedValue(
      Result.ok({
        version: "v1",
        id: "post-id-1",
        title: "Test Post",
        content: "Hello world",
        excerpt: "Hello",
        recoveredAddress: userId,
        signature: "sig",
      }),
    );

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(1);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith({
      action: "indexer-publish-post",
      data: {
        txId: "arweave-tx-1",
        blockHeight: 12345,
        author: userId,
        uri: "ar://arweave-tx-1",
        createdAt: new Date(1672531199 * 1000),
      },
    });
  });

  it("skips posts that are already indexed in the database", async () => {
    await createTestUser({ id: userId });
    await createTestPost({
      id: "arweave-tx-1",
      txId: "arweave-tx-1",
      userId,
      title: "Existing Post",
      content: "Hello",
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          transactions: {
            edges: [
              {
                node: {
                  id: "arweave-tx-1",
                  block: null,
                },
              },
            ],
          },
        },
      }),
    } as Response);

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(0);
    expect(mockEmit).not.toHaveBeenCalled();
  });
});
