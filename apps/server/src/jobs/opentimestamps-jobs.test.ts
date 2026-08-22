import {
  NetworkError,
  StampError,
  UpgradeError,
  ValidationError,
} from "@otskit/client";
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

async function seedPost(suffix: string): Promise<{
  postId: string;
  txId: string;
}> {
  const postId = `test-post-${suffix}-${Date.now()}`;
  const txId = `test-tx-${suffix}-${Date.now()}`;

  await prisma.user.create({
    data: { id: `test-user-${suffix}` },
  });

  await prisma.post.create({
    data: {
      id: postId,
      txId,
      version: "1.0",
      blockHeight: 0,
      metadataUri: `ar://${txId}`,
      title: `Test ${suffix} Post`,
      content: "Content",
      excerpt: "Excerpt",
      tags: [],
      userId: `test-user-${suffix}`,
    },
  });

  await prisma.postRevision.create({
    data: { postId, txId },
  });

  return { postId, txId };
}

async function seedPendingPostOts(
  postId: string,
  txId: string,
  pendingProof: Uint8Array,
) {
  await prisma.postOts.create({
    data: {
      postId,
      postTxId: txId,
      status: "PENDING",
      pendingProof: new Uint8Array(pendingProof),
    },
  });
}

function buildJobHandler(
  job: typeof opentimestampsStampJob | typeof opentimestampsUpgradeJob,
  name: string,
  data: { postId: string; txId: string },
) {
  return job.build().handler([{ id: name, name, data } as any]);
}

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
    const { postId, txId } = await seedPost("ots");

    const mockPendingProof = Buffer.from([0x01, 0x02]);
    otsClientMocks.stamp.mockResolvedValue(mockPendingProof);

    const mockFetch = vi.fn(() =>
      Promise.resolve(
        new Response("Content", {
          status: 200,
        }),
      ),
    );
    vi.stubGlobal("fetch", mockFetch);

    await buildJobHandler(opentimestampsStampJob, "opentimestamps-stamp", {
      postId,
      txId,
    });

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

  it("opentimestampsStampJob does not create PostOts record when calendars reject the submission", async () => {
    const { postId, txId } = await seedPost("stamp-failed");

    otsClientMocks.stamp.mockRejectedValue(
      new StampError(
        "Insufficient successful submissions (0/2 required)",
        [],
        [
          {
            calendar: "https://a.btc.calendar.opentimestamps.org",
            error: new Error("HTTP 500"),
          },
        ],
      ),
    );

    const mockFetch = vi.fn(() =>
      Promise.resolve(new Response("Content", { status: 200 })),
    );
    vi.stubGlobal("fetch", mockFetch);

    await expect(
      buildJobHandler(opentimestampsStampJob, "opentimestamps-stamp", {
        postId,
        txId,
      }),
    ).rejects.toThrow("Failed to stamp post metadata with OpenTimestamps");

    const createdPostOts = await prisma.postOts.findUnique({
      where: { postTxId: txId },
    });
    expect(createdPostOts).toBeNull();

    vi.unstubAllGlobals();
  });

  it("opentimestampsUpgradeJob uploads upgraded OTS proof to Arweave and updates status", async () => {
    const { postId, txId } = await seedPost("upgrade");

    const pendingProof = Buffer.from([0x01, 0x02]);
    const upgradedProof = Buffer.concat([pendingProof, Buffer.from([0xff])]);

    await seedPendingPostOts(postId, txId, pendingProof);

    otsClientMocks.upgrade.mockResolvedValue(upgradedProof);

    vi.mocked(arweaveUploadFile).mockResolvedValue({
      isOk: () => true,
      isErr: () => false,
      value: { id: "ots-arweave-tx-123" },
    } as any);

    await buildJobHandler(opentimestampsUpgradeJob, "opentimestamps-upgrade", {
      postId,
      txId,
    });

    const updatedPostOts = await prisma.postOts.findUnique({
      where: { postTxId: txId },
    });

    expect(updatedPostOts?.status).toBe("UPGRADED");
    expect(updatedPostOts?.otsTxId).toBe("ots-arweave-tx-123");
    expect(updatedPostOts?.pendingProof).toBeNull();

    vi.unstubAllGlobals();
  });

  it("opentimestampsUpgradeJob increments attempts when Bitcoin has not confirmed yet", async () => {
    const { postId, txId } = await seedPost("pending");

    await seedPendingPostOts(postId, txId, Buffer.from([0x01]));

    otsClientMocks.upgrade.mockRejectedValue(
      new UpgradeError("No calendar has confirmed the timestamp yet"),
    );

    await expect(
      buildJobHandler(opentimestampsUpgradeJob, "opentimestamps-upgrade", {
        postId,
        txId,
      }),
    ).rejects.toThrow("OTS proof not yet anchored in Bitcoin block");

    const updatedPostOts = await prisma.postOts.findUnique({
      where: { postTxId: txId },
    });

    expect(updatedPostOts?.status).toBe("PENDING");
    expect(updatedPostOts?.attempts).toBe(1);
    expect(updatedPostOts?.lastAttempt).not.toBeNull();

    vi.unstubAllGlobals();
  });

  it("opentimestampsUpgradeJob increments attempts when the stored proof is invalid", async () => {
    const { postId, txId } = await seedPost("invalid-proof");

    await seedPendingPostOts(postId, txId, Buffer.from([0x01]));

    otsClientMocks.upgrade.mockRejectedValue(
      new ValidationError("Invalid .ots proof format"),
    );

    await expect(
      buildJobHandler(opentimestampsUpgradeJob, "opentimestamps-upgrade", {
        postId,
        txId,
      }),
    ).rejects.toThrow("Stored OTS pending proof is invalid");

    const updatedPostOts = await prisma.postOts.findUnique({
      where: { postTxId: txId },
    });

    expect(updatedPostOts?.status).toBe("PENDING");
    expect(updatedPostOts?.attempts).toBe(1);

    vi.unstubAllGlobals();
  });

  it("opentimestampsUpgradeJob increments attempts when calendar queries fail", async () => {
    const { postId, txId } = await seedPost("network-error");

    await seedPendingPostOts(postId, txId, Buffer.from([0x01]));

    otsClientMocks.upgrade.mockRejectedValue(
      new NetworkError("All retries exhausted", { status: 503 }),
    );

    await expect(
      buildJobHandler(opentimestampsUpgradeJob, "opentimestamps-upgrade", {
        postId,
        txId,
      }),
    ).rejects.toThrow("Failed to upgrade OTS proof");

    const updatedPostOts = await prisma.postOts.findUnique({
      where: { postTxId: txId },
    });

    expect(updatedPostOts?.status).toBe("PENDING");
    expect(updatedPostOts?.attempts).toBe(1);

    vi.unstubAllGlobals();
  });
});
