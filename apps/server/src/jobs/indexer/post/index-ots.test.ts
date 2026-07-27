import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { prisma } from "@/lib/prisma";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { indexOtsForPost } from "./index-ots";

describe("index OTS for post", () => {
  let testDb: TestDatabase | undefined = undefined;

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  beforeEach(async () => {
    await testDb?.cleanup();
  });

  afterAll(async () => {
    await testDb?.close();
  });

  it("creates PostOts record with status UPGRADED when Arweave returns an OTS transaction", async () => {
    const postId = `test-post-reindex-${Date.now()}`;
    const txId = `test-tx-reindex-${Date.now()}`;
    const otsTxId = `ots-arweave-tx-${Date.now()}`;

    await prisma.user.create({ data: { id: "user-reindex" } });
    await prisma.post.create({
      data: {
        id: postId,
        txId,
        version: "1.0",
        blockHeight: 0,
        metadataUri: `ar://${txId}`,
        title: "Reindex Test",
        content: "Content",
        excerpt: "Excerpt",
        tags: [],
        userId: "user-reindex",
      },
    });
    await prisma.postRevision.create({ data: { postId, txId } });

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            transactions: {
              edges: [{ node: { id: otsTxId } }],
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", mockFetch);

    await indexOtsForPost({ postId, txId });

    const postOts = await prisma.postOts.findUnique({
      where: { postTxId: txId },
    });

    expect(postOts?.status).toBe("UPGRADED");
    expect(postOts?.otsTxId).toBe(otsTxId);

    vi.unstubAllGlobals();
  });
});
