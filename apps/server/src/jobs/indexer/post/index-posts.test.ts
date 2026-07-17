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

  it("handles pagination with multiple pages correctly using cursors", async () => {
    await createTestUser({ id: userId });

    // Mock first page of 100 transactions ending with cursor "cursor-100"
    const page1Edges = Array.from({ length: 100 }, (_, i) => ({
      cursor: `cursor-${i + 1}`,
      node: {
        id: `arweave-tx-${i + 1}`,
        block: {
          height: 1000 + i,
          timestamp: 1672531199,
        },
      },
    }));

    // Mock second page with 5 transactions
    const page2Edges = Array.from({ length: 5 }, () => ({
      cursor: `cursor-101`,
      node: {
        id: `arweave-tx-101`,
        block: {
          height: 1100,
          timestamp: 1672531199,
        },
      },
    }));

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            transactions: {
              edges: page1Edges,
            },
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            transactions: {
              edges: page2Edges,
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

    expect({
      toProcess: result.toProcess,
      emitCalls: mockEmit.mock.calls.length,
    }).toStrictEqual({
      toProcess: 105,
      emitCalls: 105,
    });

    // Verify first fetch query contained min block: 0, no after cursor
    const firstCallBody = JSON.parse(
      mockFetch.mock.calls[0][1]?.body as string,
    );
    expect(firstCallBody.query).toContain("block: { min: 0 }");
    expect(firstCallBody.query).not.toContain("after:");

    // Verify second fetch query contained min block: 0, and cursor "cursor-100"
    const secondCallBody = JSON.parse(
      mockFetch.mock.calls[1][1]?.body as string,
    );
    expect([
      secondCallBody.query.includes("block: { min: 0 }"),
      secondCallBody.query.includes('after: "cursor-100"'),
    ]).toStrictEqual([true, true]);
  });
});
