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
import { createTestPost, createTestUser } from "@/test/helpers";

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

const { fetchArweaveL1TxIds, executeIndexerSyncArweaveL1TxIdsJob } =
  await import("./sync-arweave-l1-tx-ids");

describe("sync-arweave-l1-tx-ids", () => {
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
    vi.unstubAllGlobals();
  });

  describe("fetchArweaveL1TxIds", () => {
    it("returns empty mapping when input txIds array is empty", async () => {
      const result = await fetchArweaveL1TxIds([]);
      expect(result.unwrap()).toStrictEqual({});
    });

    it("fetches and maps bundledIn.id from GraphQL response", async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                transactions: {
                  edges: [
                    {
                      node: {
                        id: "arweave-tx-1",
                        bundledIn: { id: "l1-tx-1" },
                      },
                    },
                    {
                      node: {
                        id: "arweave-tx-2",
                        bundledIn: null,
                      },
                    },
                  ],
                },
              },
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        ),
      );
      vi.stubGlobal("fetch", mockFetch);

      const result = await fetchArweaveL1TxIds([
        "arweave-tx-1",
        "arweave-tx-2",
      ]);
      expect(result.unwrap()).toStrictEqual({
        "arweave-tx-1": "l1-tx-1",
      });
    });
  });

  describe("executeIndexerSyncArweaveL1TxIdsJob", () => {
    it("updates Post and PostRevision when L1 tx ID is found", async () => {
      await createTestUser({ id: userId });

      const post1 = await createTestPost({
        id: "post-1",
        txId: "tx-arweave-1",
        userId,
      });

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                transactions: {
                  edges: [
                    {
                      node: {
                        id: "tx-arweave-1",
                        bundledIn: { id: "l1-bundle-tx-1" },
                      },
                    },
                  ],
                },
              },
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        ),
      );
      vi.stubGlobal("fetch", mockFetch);

      await executeIndexerSyncArweaveL1TxIdsJob({});

      const updatedPost = await testDb?.db.post.findUnique({
        where: { id: post1.id },
      });
      expect(updatedPost?.arweaveL1TxId).toBe("l1-bundle-tx-1");

      const updatedRevision = await testDb?.db.postRevision.findFirst({
        where: { postId: post1.id, txId: "tx-arweave-1" },
      });
      expect(updatedRevision?.arweaveL1TxId).toBe("l1-bundle-tx-1");
    });

    it("does nothing when all posts already have arweaveL1TxId", async () => {
      await createTestUser({ id: userId });

      const post1 = await createTestPost({
        id: "post-1",
        txId: "tx-arweave-1",
        userId,
      });

      await testDb?.db.post.update({
        where: { id: post1.id },
        data: { arweaveL1TxId: "already-set-l1-id" },
      });
      await testDb?.db.postRevision.updateMany({
        where: { postId: post1.id },
        data: { arweaveL1TxId: "already-set-l1-id" },
      });

      const mockFetch = vi.fn();
      vi.stubGlobal("fetch", mockFetch);

      await executeIndexerSyncArweaveL1TxIdsJob({});

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
