import { UpgradeError } from "@otskit/client";
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

const otsClientMocks = vi.hoisted(() => ({
  stamp: vi.fn(),
  upgrade: vi.fn(),
}));

vi.mock<typeof import("@otskit/client")>(import("@otskit/client"), async () => {
  const actual =
    await vi.importActual<typeof import("@otskit/client")>("@otskit/client");
  const MockOpenTimestampsClient = class {
    stamp = otsClientMocks.stamp;
    upgrade = otsClientMocks.upgrade;
  } as unknown as typeof actual.OpenTimestampsClient;
  return {
    ...actual,
    OpenTimestampsClient: MockOpenTimestampsClient,
  };
});

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
    otsClientMocks.stamp.mockReset();
    otsClientMocks.upgrade.mockReset();
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

    const mockPendingProof = Buffer.from([0x01, 0x02]);
    otsClientMocks.stamp.mockResolvedValue(mockPendingProof);

    const mockFetch = vi.fn(() =>
      Promise.resolve(
        new Response("Content for OTS test", {
          status: 200,
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
    expect(createdPostOts?.pendingProof).toStrictEqual(
      new Uint8Array(mockPendingProof),
    );
    expect(otsClientMocks.stamp).toHaveBeenCalledTimes(1);

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

    const pendingProof = Buffer.from([0x01, 0x02]);
    const upgradedProof = Buffer.concat([pendingProof, Buffer.from([0xff])]);

    await prisma.postOts.create({
      data: {
        postId,
        postTxId: txId,
        status: "PENDING",
        pendingProof,
      },
    });

    otsClientMocks.upgrade.mockResolvedValue(upgradedProof);

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

  it("opentimestampsUpgradeJob increments attempts when Bitcoin has not confirmed yet", async () => {
    const postId = `test-post-pending-${Date.now()}`;
    const txId = `test-tx-pending-${Date.now()}`;

    await prisma.user.create({
      data: { id: "test-user-pending" },
    });

    await prisma.post.create({
      data: {
        id: postId,
        txId,
        version: "1.0",
        blockHeight: 0,
        metadataUri: `ar://${txId}`,
        title: "Test Pending Post",
        content: "Content",
        excerpt: "Excerpt",
        tags: [],
        userId: "test-user-pending",
      },
    });

    await prisma.postRevision.create({
      data: { postId, txId },
    });

    await prisma.postOts.create({
      data: {
        postId,
        postTxId: txId,
        status: "PENDING",
        pendingProof: Buffer.from([0x01]),
      },
    });

    otsClientMocks.upgrade.mockRejectedValue(
      new UpgradeError("No calendar has confirmed the timestamp yet"),
    );

    await expect(
      opentimestampsUpgradeJob.build().handler([
        {
          id: "job-3",
          name: "opentimestamps-upgrade",
          data: { postId, txId },
        } as any,
      ]),
    ).rejects.toThrow("OTS proof not yet anchored in Bitcoin block");

    const updatedPostOts = await prisma.postOts.findUnique({
      where: { postTxId: txId },
    });

    expect(updatedPostOts?.status).toBe("PENDING");
    expect(updatedPostOts?.attempts).toBe(1);
    expect(updatedPostOts?.lastAttempt).not.toBeNull();

    vi.unstubAllGlobals();
  });
});
