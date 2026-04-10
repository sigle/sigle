import { serializeCV, stringAsciiCV, tupleCV } from "@stacks/transactions";
import { Result } from "better-result";
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
import { createTestUser } from "@/test/helpers";

const mockEmit = vi.fn();

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("..")>(
  import(".."),
  () =>
    ({
      indexerJob: {
        emit: (...args: unknown[]) => mockEmit(...args),
      },
      // oxlint-disable-next-line consistent-type-imports
    }) as unknown as typeof import(".."),
);

const mockStacksApiClientGET = vi.fn();
const mockGetStacksTransaction = vi.fn();

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("@/lib/stacks")>(
  import("@/lib/stacks"),
  () =>
    ({
      stacksNetwork: "testnet",
      stacksApiClient: {
        GET: (...args: unknown[]) => mockStacksApiClientGET(...args),
      },
      getStacksTransaction: (...args: unknown[]) =>
        mockGetStacksTransaction(...args),
      // oxlint-disable-next-line consistent-type-imports
    }) as unknown as typeof import("@/lib/stacks"),
);

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("@/lib/sigle")>(
  import("@/lib/sigle"),
  () =>
    ({
      sigleConfig: {
        profilesRegistryAddress:
          "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sigle-profiles-v001",
      },
      // oxlint-disable-next-line consistent-type-imports
    }) as unknown as typeof import("@/lib/sigle"),
);

// oxlint-disable-next-line consistent-type-imports
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
      // oxlint-disable-next-line consistent-type-imports
    }) as unknown as typeof import("@/lib/consola"),
);

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

  const createSetProfileEvent = (
    txId: string,
    address: string,
    uri: string,
  ) => {
    const clarityValue = tupleCV({
      a: stringAsciiCV("set-profile"),
      address: stringAsciiCV(address),
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

  it("returns 0 profiles when no events exist", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: { results: [] },
    });

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(0);
    expect(result.lastProcessedTxId).toBeUndefined();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it("returns 1 profile when API returns less than limit", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          createSetProfileEvent(
            "0xabc",
            userId,
            "https://example.com/profile-1",
          ),
        ],
      },
    });
    mockGetStacksTransaction.mockResolvedValue(
      Result.ok(createSuccessTransaction("0xabc", 100, 1700000000)),
    );

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(1);
  });

  it("emits jobs for new profiles when no existing profiles", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          createSetProfileEvent(
            "0xtx2",
            userId,
            "https://example.com/profile-2",
          ),
          createSetProfileEvent(
            "0xtx1",
            userId,
            "https://example.com/profile-1",
          ),
        ],
      },
    });
    mockGetStacksTransaction.mockImplementation((txId: string) => {
      // oxlint-disable-next-line vitest/no-conditional-in-test
      if (txId === "0xtx1") {
        return Result.ok(createSuccessTransaction(txId, 101, 1700000000));
      }
      return Result.ok(createSuccessTransaction(txId, 102, 1700000010));
    });

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(2);
    expect(result.lastProcessedTxId).toBeUndefined();
    expect(mockEmit).toHaveBeenCalledTimes(2);
    expect(mockEmit).toHaveBeenNthCalledWith(1, {
      action: "indexer-set-profile",
      data: {
        txId: "0xtx1",
        address: userId,
        uri: "https://example.com/profile-1",
      },
    });
    expect(mockEmit).toHaveBeenNthCalledWith(2, {
      action: "indexer-set-profile",
      data: {
        txId: "0xtx2",
        address: userId,
        uri: "https://example.com/profile-2",
      },
    });
  });

  it("stops processing when reaching lastProcessedTxId", async () => {
    await createTestUser({ id: userId });
    await testDb.db.profile.create({
      data: {
        id: userId,
        txId: "0xtx2",
      },
    });

    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          createSetProfileEvent(
            "0xtx1",
            userId,
            "https://example.com/profile-1",
          ),
          createSetProfileEvent(
            "0xtx2",
            userId,
            "https://example.com/profile-2",
          ),
          createSetProfileEvent(
            "0xtx3",
            userId,
            "https://example.com/profile-3",
          ),
        ],
      },
    });
    mockGetStacksTransaction.mockReturnValue(
      Result.ok(createSuccessTransaction("0xtx1", 101, 1700000000)),
    );

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(1);
    expect(result.lastProcessedTxId).toBe("0xtx2");
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith({
      action: "indexer-set-profile",
      data: expect.objectContaining({
        txId: "0xtx1",
        address: userId,
        uri: "https://example.com/profile-1",
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
          createSetProfileEvent(
            "0xtx2",
            userId,
            "https://example.com/profile-1",
          ),
        ],
      },
    });
    mockGetStacksTransaction.mockReturnValue(
      Result.ok(createSuccessTransaction("0xtx2", 102, 1700000010)),
    );

    const result = await executeIndexerIndexProfilesJob({});

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
          createSetProfileEvent(
            "0xtx2",
            userId,
            "https://example.com/profile-1",
          ),
        ],
      },
    });
    mockGetStacksTransaction.mockReturnValue(
      Result.ok(createSuccessTransaction("0xtx2", 102, 1700000010)),
    );

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(1);
    expect(mockGetStacksTransaction).toHaveBeenCalledTimes(1);
  });

  it("skips events when getStacksTransaction fails", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          createSetProfileEvent(
            "0xtx1",
            userId,
            "https://example.com/profile-1",
          ),
          createSetProfileEvent(
            "0xtx2",
            userId,
            "https://example.com/profile-2",
          ),
        ],
      },
    });
    mockGetStacksTransaction.mockImplementation((txId: string) => {
      // oxlint-disable-next-line vitest/no-conditional-in-test
      if (txId === "0xtx1") {
        return Result.err(new Error("Transaction not found"));
      }
      return Result.ok(createSuccessTransaction(txId, 102, 1700000010));
    });

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(1);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith({
      action: "indexer-set-profile",
      data: expect.objectContaining({
        txId: "0xtx2",
      }),
    });
  });

  it("skips events when transaction status is not success", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          createSetProfileEvent(
            "0xtx1",
            userId,
            "https://example.com/profile-1",
          ),
          createSetProfileEvent(
            "0xtx2",
            userId,
            "https://example.com/profile-2",
          ),
        ],
      },
    });
    mockGetStacksTransaction.mockImplementation((txId: string) => {
      // oxlint-disable-next-line vitest/no-conditional-in-test
      if (txId === "0xtx1") {
        return Result.ok({
          ...createSuccessTransaction(txId, 101, 1700000000),
          tx_status: "abort_by_response",
        });
      }
      return Result.ok(createSuccessTransaction(txId, 102, 1700000010));
    });

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(1);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith({
      action: "indexer-set-profile",
      data: expect.objectContaining({
        txId: "0xtx2",
      }),
    });
  });

  it("breaks loop on API error", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      error: { error: "Internal server error" },
    });

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(0);
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it("handles pagination with multiple pages", async () => {
    const eventsPage1 = Array.from({ length: 50 }, (_, i) =>
      createSetProfileEvent(
        `0xtx${i}`,
        userId,
        `https://example.com/profile-${i}`,
      ),
    );
    const eventsPage2 = [
      createSetProfileEvent("0xtx50", userId, "https://example.com/profile-50"),
      createSetProfileEvent("0xtx51", userId, "https://example.com/profile-51"),
    ];

    mockStacksApiClientGET
      .mockResolvedValueOnce({ data: { results: eventsPage1 } })
      .mockResolvedValueOnce({ data: { results: eventsPage2 } });

    mockGetStacksTransaction.mockImplementation((txId: string) =>
      Result.ok(createSuccessTransaction(txId, 100, 1700000000)),
    );

    const result = await executeIndexerIndexProfilesJob({});

    expect(mockStacksApiClientGET).toHaveBeenCalledTimes(2);
    expect(mockStacksApiClientGET).toHaveBeenNthCalledWith(
      1,
      "/extended/v1/contract/{contract_id}/events",
      expect.objectContaining({
        params: {
          path: {
            contract_id: sigleConfig.profilesRegistryAddress,
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
            contract_id: sigleConfig.profilesRegistryAddress,
          },
          query: { limit: 50, offset: 50 },
        },
      }),
    );
    expect(result.toProcess).toBe(52);
    expect(mockEmit).toHaveBeenCalledTimes(52);
  });

  it("processes oldest profiles first (reversed order)", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: {
        results: [
          createSetProfileEvent(
            "0xtx2",
            userId,
            "https://example.com/profile-2",
          ),
          createSetProfileEvent(
            "0xtx1",
            userId,
            "https://example.com/profile-1",
          ),
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
      return Result.ok(
        createSuccessTransaction(txId, heights[txId], timestamps[txId]),
      );
    });

    await executeIndexerIndexProfilesJob({});

    expect(mockEmit).toHaveBeenNthCalledWith(1, {
      action: "indexer-set-profile",
      data: expect.objectContaining({
        txId: "0xtx1",
        address: userId,
      }),
    });
    expect(mockEmit).toHaveBeenNthCalledWith(2, {
      action: "indexer-set-profile",
      data: expect.objectContaining({
        txId: "0xtx2",
        address: userId,
      }),
    });
  });

  it("handles empty API response with undefined events", async () => {
    mockStacksApiClientGET.mockResolvedValue({
      data: { results: undefined },
    });

    const result = await executeIndexerIndexProfilesJob({});

    expect(result.toProcess).toBe(0);
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it("handles pagination with more than two pages", async () => {
    const eventsPage1 = Array.from({ length: 50 }, (_, i) =>
      createSetProfileEvent(
        `0xtx${i}`,
        userId,
        `https://example.com/profile-${i}`,
      ),
    );
    const eventsPage2 = Array.from({ length: 50 }, (_, i) =>
      createSetProfileEvent(
        `0xtx${50 + i}`,
        userId,
        `https://example.com/profile-${50 + i}`,
      ),
    );
    const eventsPage3 = [
      createSetProfileEvent(
        "0xtx100",
        userId,
        "https://example.com/profile-100",
      ),
    ];

    mockStacksApiClientGET
      .mockResolvedValueOnce({ data: { results: eventsPage1 } })
      .mockResolvedValueOnce({ data: { results: eventsPage2 } })
      .mockResolvedValueOnce({ data: { results: eventsPage3 } });

    mockGetStacksTransaction.mockImplementation((txId: string) =>
      Result.ok(createSuccessTransaction(txId, 100, 1700000000)),
    );

    const result = await executeIndexerIndexProfilesJob({});

    expect(mockStacksApiClientGET).toHaveBeenCalledTimes(3);
    expect(result.toProcess).toBe(101);
    expect(mockEmit).toHaveBeenCalledTimes(101);

    const offsets = mockStacksApiClientGET.mock.calls.map(
      (call) => call[1]?.params?.query?.offset,
    );
    expect(offsets).toStrictEqual([0, 50, 100]);
  });
});
