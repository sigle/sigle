import {
  BITCOIN_ATTESTATION_TAG,
  buildOtsFileBuffer,
  calculateSha256,
} from "@sigle/sdk";
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
import { prisma } from "@/lib/prisma";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { opentimestampsStampJob } from "./opentimestamps-stamp";
import { opentimestampsUpgradeJob } from "./opentimestamps-upgrade";

vi.mock<typeof import("@/lib/arweave")>(
  import("@/lib/arweave"),
  () =>
    ({
      arweaveUploadFile: vi.fn(),
    }) as unknown as typeof import("@/lib/arweave"),
);

describe("openTimestamps jobs", () => {
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

  it("opentimestampsStampJob stamps content and creates PostOts record", async () => {
    const postId = `test-post-${Date.now()}`;
    const txId = `test-tx-${Date.now()}`;

    await prisma.user.create({
      data: { id: "test-user-ots" },
    });

    await prisma.post.create({
      data: {
        id: postId,
        txId,
        version: "1.0",
        blockHeight: 0,
        metadataUri: `ar://${txId}`,
        title: "Test OTS Post",
        content: "Content for OTS test",
        excerpt: "Excerpt",
        tags: ["ots"],
        userId: "test-user-ots",
      },
    });

    await prisma.postRevision.create({
      data: {
        postId,
        txId,
      },
    });

    const mockCalendarOps = Buffer.from([0x01, 0x02]);
    const mockFetch = vi.fn(() =>
      Promise.resolve(
        new Response(mockCalendarOps, {
          status: 200,
          headers: { "Content-Type": "application/octet-stream" },
        }),
      ),
    );
    vi.stubGlobal("fetch", mockFetch);

    await opentimestampsStampJob.build().handler([
      {
        id: "job-1",
        name: "opentimestamps-stamp",
        data: { postId, txId },
      } as any,
    ]);

    const createdPostOts = await prisma.postOts.findUnique({
      where: { postTxId: txId },
    });

    expect(createdPostOts).not.toBeNull();
    expect(createdPostOts?.status).toBe("PENDING");
    expect(createdPostOts?.pendingProof).not.toBeNull();

    vi.unstubAllGlobals();
  });

  it("opentimestampsUpgradeJob uploads upgraded OTS proof to Arweave and updates status", async () => {
    const postId = `test-post-upgrade-${Date.now()}`;
    const txId = `test-tx-upgrade-${Date.now()}`;

    await prisma.user.create({
      data: { id: "test-user-upgrade" },
    });

    await prisma.post.create({
      data: {
        id: postId,
        txId,
        version: "1.0",
        blockHeight: 0,
        metadataUri: `ar://${txId}`,
        title: "Test Upgrade Post",
        content: "Content",
        excerpt: "Excerpt",
        tags: [],
        userId: "test-user-upgrade",
      },
    });

    await prisma.postRevision.create({
      data: { postId, txId },
    });

    const hash = calculateSha256("Content");
    const pendingOps = Buffer.from([0x01]);
    const pendingProof = new Uint8Array(buildOtsFileBuffer(hash, pendingOps));

    await prisma.postOts.create({
      data: {
        postId,
        postTxId: txId,
        status: "PENDING",
        pendingProof,
      },
    });

    const upgradedOps = Buffer.concat([pendingOps, BITCOIN_ATTESTATION_TAG]);
    const mockFetch = vi.fn(() =>
      Promise.resolve(
        new Response(upgradedOps, {
          status: 200,
          headers: { "Content-Type": "application/octet-stream" },
        }),
      ),
    );
    vi.stubGlobal("fetch", mockFetch);

    vi.mocked(arweaveUploadFile).mockResolvedValue({
      isOk: () => true,
      isErr: () => false,
      value: { id: "ots-arweave-tx-123" },
    } as any);

    await opentimestampsUpgradeJob.build().handler([
      {
        id: "job-2",
        name: "opentimestamps-upgrade",
        data: { postId, txId },
      } as any,
    ]);

    const updatedPostOts = await prisma.postOts.findUnique({
      where: { postTxId: txId },
    });

    expect(updatedPostOts?.status).toBe("UPGRADED");
    expect(updatedPostOts?.otsTxId).toBe("ots-arweave-tx-123");
    expect(updatedPostOts?.pendingProof).toBeNull();

    vi.unstubAllGlobals();
  });
});
