import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { createTestUser } from "@/test/helpers";

const mockEmit = vi.fn();

// SAFETY: vitest swaps this module at runtime and the job under test only
// calls `indexerJob.emit`, which the factory below implements.
// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("..")>(
  import(".."),
  () =>
    ({
      indexerJob: {
        emit: (...args: unknown[]) => mockEmit(...args),
      },
    }) as Partial<typeof import("..")>,
);

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("@/lib/consola")>(
  import("@/lib/consola"),
  async (importOriginal) => {
    const { consola } = await importOriginal();

    vi.spyOn(consola, "debug").mockReturnValue(undefined);
    vi.spyOn(consola, "info").mockReturnValue(undefined);
    vi.spyOn(consola, "error").mockReturnValue(undefined);
    vi.spyOn(consola, "warn").mockReturnValue(undefined);

    return { consola };
  },
);

const mockFetch = vi.spyOn(globalThis, "fetch");

const { executeIndexerIndexProfilesJob } = await import("./index-profiles");

describe("executeIndexerIndexProfilesJob", () => {
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

  const createEdge = (txId: string, blockHeight?: number) => ({
    cursor: `cursor-${txId}`,
    node: {
      id: txId,
      block: blockHeight === undefined ? null : { height: blockHeight },
    },
  });

  it("returns 0 profiles when no Arweave transactions exist", async () => {
    mockFetch.mockResolvedValue(
      Response.json({
        data: {
          transactions: {
            edges: [],
          },
        },
      }),
    );

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(0);
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it("emits jobs for new profiles", async () => {
    await createTestUser({ id: userId });

    mockFetch.mockResolvedValue(
      Response.json({
        data: {
          transactions: {
            edges: [createEdge("arweave-tx-1", 12345)],
          },
        },
      }),
    );

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(1);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith({
      action: "indexer-set-profile",
      data: {
        txId: "arweave-tx-1",
        uri: "ar://arweave-tx-1",
        blockHeight: 12345,
      },
    });
  });

  it("indexes pending transactions with a block height of 0", async () => {
    await createTestUser({ id: userId });

    mockFetch.mockResolvedValue(
      Response.json({
        data: {
          transactions: {
            edges: [createEdge("arweave-tx-pending")],
          },
        },
      }),
    );

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(1);
    expect(mockEmit).toHaveBeenCalledWith({
      action: "indexer-set-profile",
      data: {
        txId: "arweave-tx-pending",
        uri: "ar://arweave-tx-pending",
        blockHeight: 0,
      },
    });
  });

  it("skips profiles that are already indexed in the database", async () => {
    await createTestUser({
      id: userId,
      profile: {
        txId: "arweave-tx-1",
        blockHeight: 12345,
      },
    });

    mockFetch.mockResolvedValue(
      Response.json({
        data: {
          transactions: {
            edges: [createEdge("arweave-tx-1", 12345)],
          },
        },
      }),
    );

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(0);
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it("starts from the latest mined profile block height", async () => {
    await createTestUser({
      id: userId,
      profile: {
        txId: "arweave-tx-1",
        blockHeight: 500,
      },
    });

    mockFetch.mockResolvedValue(
      Response.json({
        data: {
          transactions: {
            edges: [],
          },
        },
      }),
    );

    await executeIndexerIndexProfilesJob({});

    const body = JSON.parse(String(mockFetch.mock.calls[0][1]?.body));

    expect(body.query).toContain("block: { min: 500 }");
    expect(body.query).toContain('values: ["profile"]');
  });

  it("handles pagination with multiple pages correctly using cursors", async () => {
    await createTestUser({ id: userId });

    const page1Edges = Array.from({ length: 100 }, (_, i) =>
      createEdge(`arweave-tx-${i + 1}`, 1000 + i),
    );

    const page2Edges = Array.from({ length: 5 }, () =>
      createEdge("arweave-tx-101", 1100),
    );

    mockFetch
      .mockResolvedValueOnce(
        Response.json({
          data: {
            transactions: {
              edges: page1Edges,
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          data: {
            transactions: {
              edges: page2Edges,
            },
          },
        }),
      );

    const result = await executeIndexerIndexProfilesJob({});

    expect({
      toProcess: result.toProcess,
      emitCalls: mockEmit.mock.calls.length,
    }).toStrictEqual({
      toProcess: 105,
      emitCalls: 105,
    });

    const firstCallBody = JSON.parse(String(mockFetch.mock.calls[0][1]?.body));

    expect(firstCallBody.query).toContain("block: { min: 0 }");
    expect(firstCallBody.query).not.toContain("after:");

    const secondCallBody = JSON.parse(String(mockFetch.mock.calls[1][1]?.body));

    expect([
      secondCallBody.query.includes("block: { min: 0 }"),
      secondCallBody.query.includes('after: "cursor-arweave-tx-100"'),
    ]).toStrictEqual([true, true]);
  });

  it("throws an error when GraphQL response is missing transactions edges", async () => {
    mockFetch.mockResolvedValue(
      Response.json({
        data: {},
      }),
    );

    await expect(executeIndexerIndexProfilesJob({})).rejects.toThrow(
      "Invalid GraphQL response: transactions.edges is missing",
    );
  });
});
