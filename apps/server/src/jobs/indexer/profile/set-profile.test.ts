import { ProfileMetadataSchemaId } from "@sigle/sdk";
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
import { getProfileMetadataFromUri } from "@/lib/metadata";
import { InvalidMetadataError } from "@/lib/metadata/errors";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { createTestUser } from "@/test/helpers";

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("@/lib/metadata")>(import("@/lib/metadata"), () => ({
  getProfileMetadataFromUri: vi.fn(),
}));

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("../../generate-image-blurhash")>(
  import("../../generate-image-blurhash"),
  async (importOriginal) => {
    const module = await importOriginal();

    vi.spyOn(module.generateImageBlurhashJob, "emit").mockResolvedValue(null);

    return module;
  },
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

const { executeIndexerSetProfileJob } = await import("./set-profile");

const createMetadata = (
  overrides: Partial<{
    displayName: string;
    description: string;
    website: string;
    twitter: string;
    picture: string;
    coverPicture: string;
  }> = {},
) => ({
  $schema: ProfileMetadataSchemaId.LATEST,
  content: {
    id: "profile-1",
    displayName: "Alice",
    ...overrides,
  },
});

describe("executeIndexerSetProfileJob", () => {
  // oxlint-disable-next-line init-declarations
  let testDb: TestDatabase;
  const userId = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
  const otherUserId = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

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

  const mockProfileMetadata = (
    metadata: ReturnType<typeof createMetadata>,
    signature = "sig-1",
    recoveredAddress = userId,
  ) => {
    vi.mocked(getProfileMetadataFromUri).mockResolvedValue(
      Result.ok({
        metadata,
        recoveredAddress,
        signature,
      }),
    );
  };

  it("creates the profile from signed metadata", async () => {
    await createTestUser({ id: userId });
    mockProfileMetadata(createMetadata());

    await executeIndexerSetProfileJob({
      txId: "arweave-tx-1",
      uri: "ar://arweave-tx-1",
      blockHeight: 100,
    });

    const profile = await testDb.db.profile.findUnique({
      where: { id: userId },
    });

    expect(profile).toMatchObject({
      id: userId,
      txId: "arweave-tx-1",
      blockHeight: 100,
      signature: "sig-1",
      displayName: "Alice",
    });
  });

  it("creates the user when the signer has no account yet", async () => {
    mockProfileMetadata(createMetadata(), "sig-1", otherUserId);

    await executeIndexerSetProfileJob({
      txId: "arweave-tx-1",
      uri: "ar://arweave-tx-1",
      blockHeight: 100,
    });

    const profile = await testDb.db.profile.findUnique({
      where: { id: otherUserId },
    });

    expect(profile).toMatchObject({
      id: otherUserId,
      txId: "arweave-tx-1",
    });
  });

  it("updates the existing profile", async () => {
    await createTestUser({
      id: userId,
      profile: {
        displayName: "Old name",
        txId: "arweave-tx-1",
        blockHeight: 50,
        signature: "sig-old",
      },
    });
    mockProfileMetadata(createMetadata({ displayName: "New name" }), "sig-2");

    await executeIndexerSetProfileJob({
      txId: "arweave-tx-2",
      uri: "ar://arweave-tx-2",
      blockHeight: 100,
    });

    const profile = await testDb.db.profile.findUnique({
      where: { id: userId },
    });

    expect(profile).toMatchObject({
      displayName: "New name",
      txId: "arweave-tx-2",
      blockHeight: 100,
      signature: "sig-2",
    });
  });

  it("skips replayed metadata with an already indexed signature", async () => {
    await createTestUser({
      id: userId,
      profile: {
        displayName: "Original name",
        txId: "arweave-tx-1",
        blockHeight: 50,
        signature: "sig-1",
      },
    });
    mockProfileMetadata(createMetadata({ displayName: "Replayed name" }));

    await executeIndexerSetProfileJob({
      txId: "arweave-tx-2",
      uri: "ar://arweave-tx-2",
      blockHeight: 100,
    });

    const profile = await testDb.db.profile.findUnique({
      where: { id: userId },
    });

    expect(profile).toMatchObject({
      displayName: "Original name",
      txId: "arweave-tx-1",
      blockHeight: 50,
      signature: "sig-1",
    });
  });

  it("skips stale metadata mined before the current profile", async () => {
    await createTestUser({
      id: userId,
      profile: {
        displayName: "Current name",
        txId: "arweave-tx-2",
        blockHeight: 200,
        signature: "sig-current",
      },
    });
    mockProfileMetadata(
      createMetadata({ displayName: "Stale name" }),
      "sig-old",
    );

    await executeIndexerSetProfileJob({
      txId: "arweave-tx-1",
      uri: "ar://arweave-tx-1",
      blockHeight: 100,
    });

    const profile = await testDb.db.profile.findUnique({
      where: { id: userId },
    });

    expect(profile).toMatchObject({
      displayName: "Current name",
      txId: "arweave-tx-2",
      blockHeight: 200,
      signature: "sig-current",
    });
  });

  it("does not write a profile when metadata is invalid", async () => {
    await createTestUser({ id: userId });
    vi.mocked(getProfileMetadataFromUri).mockResolvedValue(
      Result.err(new InvalidMetadataError({ error: "bad metadata" })),
    );

    await executeIndexerSetProfileJob({
      txId: "arweave-tx-1",
      uri: "ar://arweave-tx-1",
      blockHeight: 100,
    });

    const profile = await testDb.db.profile.findUnique({
      where: { id: userId },
    });

    expect(profile).toBeNull();
  });

  it("connects the profile picture media image", async () => {
    await createTestUser({ id: userId });
    mockProfileMetadata(
      createMetadata({ picture: "ipfs://QmPicture" }),
      "sig-1",
    );

    await executeIndexerSetProfileJob({
      txId: "arweave-tx-1",
      uri: "ar://arweave-tx-1",
      blockHeight: 100,
    });

    const profile = await testDb.db.profile.findUnique({
      where: { id: userId },
    });

    expect(profile?.pictureUriId).toBe("ipfs://QmPicture");
  });
});
