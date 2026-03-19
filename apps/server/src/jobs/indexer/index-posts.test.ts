import type { Result } from "better-result";
import { serializeCV, stringAsciiCV, tupleCV } from "@stacks/transactions";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { sigleConfig } from "@/lib/sigle";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { createTestPost, createTestUser } from "@/test/helpers";

const mockEmit = vi.fn();

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("./index")>(import("./index"), () => ({
  indexerJob: {
    emit: (...args: unknown[]) => mockEmit(...args),
  },
}));

const mockStacksApiClientGET = vi.fn();
const mockGetStacksTransaction = vi.fn();

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("@/lib/stacks")>(import("@/lib/stacks"), () => ({
  stacksNetwork: "testnet",
  stacksApiClient: {
    GET: (...args: unknown[]) => mockStacksApiClientGET(...args),
  },
  getStacksTransaction: (...args: unknown[]) =>
    mockGetStacksTransaction(...args),
}));

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("@/lib/consola")>(import("@/lib/consola"), () => ({
  consola: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const { executeIndexerIndexPostsJob } = await import("./index-posts");

describe("executeIndexerIndexPostsJob", () => {
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

  const createPublishEvent = (txId: string, author: string, uri: string) => {
    const clarityValue = tupleCV({
      a: stringAsciiCV("publish-post"),
      author: stringAsciiCV(author),
      uri: stringAsciiCV(uri),
    });
    return {
      tx_id: txId,
      event_type: "smart_contract_log" as const,
      contract_log: {
        topic: "print" as const,
        value: {
          hex: serializeCV(clarityValue),
        },
      },
    };
  };

  const createSuccessTransaction = (
    txId: string,
    blockHeight: number,
    timestamp: number,
  ) => ({
    tx_id: txId,
    tx_status: "success" as const,
    block_height: blockHeight,
    burn_block_time: timestamp,
  });

  const createOkResult = <T>(value: T) =>
    ({ isOk: () => true, isErr: () => false, value }) as Result<T, Error>;
  const createErrResult = <T>(error: Error) =>
    ({ isOk: () => false, isErr: () => true, error }) as Result<T, Error>;

  it("returns 0 posts when no events exist", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: { results: [] },
    });

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(0);
    expect(result.lastProcessedTxId).toBeUndefined();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it("returns 1 post when API returns less than limit", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          createPublishEvent("0xabc", userId, "https://example.com/post-1"),
        ],
      },
    });
    mockGetStacksTransaction.mockResolvedValue(
      createOkResult(createSuccessTransaction("0xabc", 100, 1700000000)),
    );

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(1);
  });

  it("emits jobs for new posts when no existing posts", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          createPublishEvent("0xtx2", userId, "https://example.com/post-2"),
          createPublishEvent("0xtx1", userId, "https://example.com/post-1"),
        ],
      },
    });
    mockGetStacksTransaction.mockImplementation((txId: string) => {
      if (txId === "0xtx1") {
        return createOkResult(createSuccessTransaction(txId, 101, 1700000000));
      }
      return createOkResult(createSuccessTransaction(txId, 102, 1700000010));
    });

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(2);
    expect(result.lastProcessedTxId).toBeUndefined();
    expect(mockEmit).toHaveBeenCalledTimes(2);
    expect(mockEmit).toHaveBeenNthCalledWith(1, {
      action: "indexer-publish-post",
      data: {
        txId: "0xtx1",
        blockHeight: 101,
        author: userId,
        uri: "https://example.com/post-1",
        createdAt: expect.any(Date),
      },
    });
    expect(mockEmit).toHaveBeenNthCalledWith(2, {
      action: "indexer-publish-post",
      data: {
        txId: "0xtx2",
        blockHeight: 102,
        author: userId,
        uri: "https://example.com/post-2",
        createdAt: expect.any(Date),
      },
    });
  });

  it("stops processing when reaching lastProcessedTxId", async () => {
    await createTestUser({ id: userId });
    await createTestPost({
      id: "post-existing",
      userId,
      txId: "0xtx2",
      blockHeight: 102,
    });

    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          createPublishEvent("0xtx1", userId, "https://example.com/post-1"),
          createPublishEvent("0xtx2", userId, "https://example.com/post-2"),
          createPublishEvent("0xtx3", userId, "https://example.com/post-3"),
        ],
      },
    });
    mockGetStacksTransaction.mockReturnValue(
      createOkResult(createSuccessTransaction("0xtx1", 101, 1700000000)),
    );

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(1);
    expect(result.lastProcessedTxId).toBe("0xtx2");
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith({
      action: "indexer-publish-post",
      data: expect.objectContaining({
        txId: "0xtx1",
        author: userId,
        uri: "https://example.com/post-1",
      }),
    });
  });

  it("skips events that are not smart_contract_log type", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          {
            tx_id: "0xtx1",
            event_type: "coinbase",
          },
          createPublishEvent("0xtx2", userId, "https://example.com/post-1"),
        ],
      },
    });
    mockGetStacksTransaction.mockReturnValue(
      createOkResult(createSuccessTransaction("0xtx2", 102, 1700000010)),
    );

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(1);
    expect(mockGetStacksTransaction).toHaveBeenCalledTimes(1);
  });

  it("skips events with invalid event log schema", async () => {
    const invalidClarityValue = tupleCV({
      a: stringAsciiCV("unknown-action"),
    });
    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          {
            tx_id: "0xtx1",
            event_type: "smart_contract_log",
            contract_log: {
              topic: "print",
              value: {
                hex: serializeCV(invalidClarityValue),
              },
            },
          },
          createPublishEvent("0xtx2", userId, "https://example.com/post-1"),
        ],
      },
    });
    mockGetStacksTransaction.mockReturnValue(
      createOkResult(createSuccessTransaction("0xtx2", 102, 1700000010)),
    );

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(1);
    expect(mockGetStacksTransaction).toHaveBeenCalledTimes(1);
  });

  it("skips events when getStacksTransaction fails", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          createPublishEvent("0xtx1", userId, "https://example.com/post-1"),
          createPublishEvent("0xtx2", userId, "https://example.com/post-2"),
        ],
      },
    });
    mockGetStacksTransaction.mockImplementation((txId: string) => {
      if (txId === "0xtx1") {
        return createErrResult(new Error("Transaction not found"));
      }
      return createOkResult(createSuccessTransaction(txId, 102, 1700000010));
    });

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(1);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith({
      action: "indexer-publish-post",
      data: expect.objectContaining({
        txId: "0xtx2",
      }),
    });
  });

  it("skips events when transaction status is not success", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          createPublishEvent("0xtx1", userId, "https://example.com/post-1"),
          createPublishEvent("0xtx2", userId, "https://example.com/post-2"),
        ],
      },
    });
    mockGetStacksTransaction.mockImplementation((txId: string) => {
      if (txId === "0xtx1") {
        return createOkResult({
          ...createSuccessTransaction(txId, 101, 1700000000),
          tx_status: "abort_by_response",
        });
      }
      return createOkResult(createSuccessTransaction(txId, 102, 1700000010));
    });

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(1);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith({
      action: "indexer-publish-post",
      data: expect.objectContaining({
        txId: "0xtx2",
      }),
    });
  });

  it("breaks loop on API error", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      error: { error: "Internal server error" },
    });

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(0);
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it("handles pagination with multiple pages", async () => {
    const eventsPage1 = Array.from({ length: 50 }, (_, i) =>
      createPublishEvent(`0xtx${i}`, userId, `https://example.com/post-${i}`),
    );
    const eventsPage2 = [
      createPublishEvent("0xtx50", userId, "https://example.com/post-50"),
      createPublishEvent("0xtx51", userId, "https://example.com/post-51"),
    ];

    mockStacksApiClientGET
      .mockResolvedValueOnce({ data: { results: eventsPage1 } })
      .mockResolvedValueOnce({ data: { results: eventsPage2 } });

    mockGetStacksTransaction.mockImplementation((txId: string) =>
      createOkResult(createSuccessTransaction(txId, 100, 1700000000)),
    );

    const result = await executeIndexerIndexPostsJob({});

    expect(mockStacksApiClientGET).toHaveBeenCalledTimes(2);
    expect(mockStacksApiClientGET).toHaveBeenNthCalledWith(
      1,
      "/extended/v1/contract/{contract_id}/events",
      expect.objectContaining({
        params: {
          path: {
            contract_id: sigleConfig.registryAddress,
          },
          query: { limit: 50, offset: 0 },
        },
      }),
    );
    expect(mockStacksApiClientGET).toHaveBeenNthCalledWith(
      2,
      "/extended/v1/contract/{contract_id}/events",
      expect.objectContaining({
        params: {
          path: {
            contract_id: sigleConfig.registryAddress,
          },
          query: { limit: 50, offset: 50 },
        },
      }),
    );
    expect(result.toProcess).toBe(52);
    expect(mockEmit).toHaveBeenCalledTimes(52);
  });

  it("processes oldest posts first (reversed order)", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          createPublishEvent("0xtx2", userId, "https://example.com/post-2"),
          createPublishEvent("0xtx1", userId, "https://example.com/post-1"),
        ],
      },
    });
    mockGetStacksTransaction.mockImplementation((txId: string) => {
      const heights: Record<string, number> = {
        "0xtx1": 100,
        "0xtx2": 101,
      };
      const timestamps: Record<string, number> = {
        "0xtx1": 1700000000,
        "0xtx2": 1700000010,
      };
      return createOkResult(
        createSuccessTransaction(txId, heights[txId], timestamps[txId]),
      );
    });

    await executeIndexerIndexPostsJob({});

    expect(mockEmit).toHaveBeenNthCalledWith(1, {
      action: "indexer-publish-post",
      data: expect.objectContaining({
        txId: "0xtx1",
        blockHeight: 100,
      }),
    });
    expect(mockEmit).toHaveBeenNthCalledWith(2, {
      action: "indexer-publish-post",
      data: expect.objectContaining({
        txId: "0xtx2",
        blockHeight: 101,
      }),
    });
  });

  it("handles empty API response with undefined events", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: { results: undefined },
    });

    const result = await executeIndexerIndexPostsJob({});

    expect(result.toProcess).toBe(0);
    expect(mockEmit).not.toHaveBeenCalled();
  });
});
