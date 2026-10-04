import { verifyMetadataSignature } from "@sigle/sdk";
import { Result } from "better-result";
import { H3Event, type getRouterParam } from "nitro/h3";
import { PostHog } from "posthog-node";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { generateImageBlurhashJob } from "@/jobs/generate-image-blurhash";
import { arweaveUploadFile } from "@/lib/arweave";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import {
  createTestDraft,
  createTestPost,
  createTestUser,
} from "@/test/helpers";

vi.mock<typeof import("nitro")>(import("nitro"), () => ({
  defineRouteMeta: vi.fn(),
}));

const { mockGetRouterParam } = vi.hoisted(() => ({
  mockGetRouterParam: vi.fn<typeof getRouterParam>(),
}));

const mockReadValidatedBodyZod = vi.fn();

vi.mock<typeof import("nitro/h3")>(import("nitro/h3"), async () => {
  const actual = await vi.importActual("nitro/h3");

  return {
    ...actual,
    getRouterParam: mockGetRouterParam,
  };
});

vi.mock<typeof import("@/lib/nitro")>(import("@/lib/nitro"), () => ({
  readValidatedBodyZod: (...args: unknown[]) =>
    mockReadValidatedBodyZod(...args),
}));

vi.mock<typeof import("@/lib/arweave")>(import("@/lib/arweave"), () => ({
  arweaveUploadFile: vi.fn(),
}));

let mockStacksEnv: "mainnet" | "testnet" = "testnet";

vi.mock(import("@/env"), async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/env")>();

  return {
    ...actual,
    env: {
      ...actual.env,
      get STACKS_ENV() {
        return mockStacksEnv;
      },
    },
  };
});

vi.mock<typeof import("@sigle/sdk")>(import("@sigle/sdk"), async () => {
  const actual = await vi.importActual("@sigle/sdk");

  return {
    ...actual,
    verifyMetadataSignature: vi.fn(),
  };
});

vi.mock<typeof import("@/lib/users")>(import("@/lib/users"), () => ({
  isUserWhitelisted: vi.fn().mockReturnValue(true),
}));

// The job's pg-boss emit has no registered boss in tests, so stub it.
vi.spyOn(generateImageBlurhashJob, "emit").mockResolvedValue(null);

const { default: handler } = await import("./upload-metadata.post");

function createMockPosthog(): PostHog {
  const posthog = new PostHog("test-api-key", { host: "http://localhost" });

  vi.spyOn(posthog, "capture").mockReturnValue(undefined);

  return posthog;
}

describe("api/protected/drafts/[draftId]/upload-metadata.post", () => {
  // oxlint-disable-next-line init-declarations
  let testDb: TestDatabase;
  const userId = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  beforeEach(async () => {
    await testDb.cleanup();
    vi.clearAllMocks();
    mockStacksEnv = "testnet";
  });

  afterAll(async () => {
    await testDb.close();
  });

  it("publishes new draft and creates initial revision without Root-TX tag", async () => {
    const user = await createTestUser({ id: userId });
    await createTestDraft({
      id: "draft-1",
      userId: user.id,
      title: "New Draft",
    });

    mockGetRouterParam.mockReturnValue("draft-1");

    const mockMetadata = {
      $schema: "https://json-schemas.sigle.io/posts/1.0.0.json",
      content: {
        id: "draft-1",
        title: "New Draft Title",
        content: "Draft content",
        tags: ["tech"],
      },
    };

    mockReadValidatedBodyZod.mockResolvedValue({
      type: "draft",
      metadata: mockMetadata,
    });

    vi.mocked(verifyMetadataSignature).mockReturnValue(
      Result.ok({
        recoveredAddress: userId,
        publicKey: "pubkey-draft-1",
        signature: "sig-draft-1",
      }),
    );

    vi.mocked(arweaveUploadFile).mockResolvedValue(
      Result.ok({ id: "arweave-tx-draft" }),
    );

    const mockEvent = new H3Event(
      new Request(
        "http://localhost/api/protected/drafts/draft-1/upload-metadata",
      ),
    );

    mockEvent.context.user = { id: userId };
    mockEvent.context.$posthog = createMockPosthog();

    const result = await handler(mockEvent);

    expect(result).toStrictEqual({
      id: "arweave-tx-draft",
      postId: "arweave-tx-draft",
      arweaveId: "arweave-tx-draft",
    });
    expect(arweaveUploadFile).toHaveBeenCalledWith({
      file: Buffer.from(JSON.stringify(mockMetadata)),
      contentType: "application/json",
      tags: [{ name: "Author", value: userId }],
    });

    const post = await testDb.db.post.findUnique({
      where: { id: "arweave-tx-draft" },
    });

    expect(post).toMatchObject({
      id: "arweave-tx-draft",
      txId: "arweave-tx-draft",
      title: "New Draft Title",
      revisionsCount: 1,
    });

    const revisions = await testDb.db.postRevision.findMany({
      where: { postId: "arweave-tx-draft" },
    });

    expect(revisions.map((r) => r.txId)).toStrictEqual(["arweave-tx-draft"]);
  });

  it("edits existing post, adds Root-TX tag, increments revisionsCount, and creates new PostRevision", async () => {
    const user = await createTestUser({ id: userId });

    const originalPost = await createTestPost({
      id: "original-post-id",
      txId: "original-post-id",
      userId: user.id,
      title: "Original Post",
      content: "Original content",
    });

    mockGetRouterParam.mockReturnValue(originalPost.id);

    const editedMetadata = {
      $schema: "https://json-schemas.sigle.io/posts/1.0.0.json",
      content: {
        id: originalPost.id,
        title: "Edited Post Title",
        content: "Edited content",
        tags: ["edited"],
      },
    };

    mockReadValidatedBodyZod.mockResolvedValue({
      type: "published",
      metadata: editedMetadata,
    });

    vi.mocked(verifyMetadataSignature).mockReturnValue(
      Result.ok({
        recoveredAddress: userId,
        publicKey: "pubkey-edit-1",
        signature: "sig-edit-1",
      }),
    );

    vi.mocked(arweaveUploadFile).mockResolvedValue(
      Result.ok({ id: "arweave-tx-edit-1" }),
    );

    const mockEvent = new H3Event(
      new Request(
        `http://localhost/api/protected/drafts/${originalPost.id}/upload-metadata`,
      ),
    );

    mockEvent.context.user = { id: userId };
    mockEvent.context.$posthog = createMockPosthog();

    const result = await handler(mockEvent);

    expect(result).toStrictEqual({
      id: originalPost.id,
      postId: originalPost.id,
      arweaveId: "arweave-tx-edit-1",
    });

    // Verify Root-TX tag was included
    expect(arweaveUploadFile).toHaveBeenCalledWith({
      file: Buffer.from(JSON.stringify(editedMetadata)),
      contentType: "application/json",
      tags: [
        { name: "Author", value: userId },
        { name: "Root-TX", value: originalPost.id },
      ],
    });

    // Verify Post table was updated with new txId, title, content, and incremented revisionsCount
    const updatedPost = await testDb.db.post.findUnique({
      where: { id: originalPost.id },
    });

    expect(updatedPost).toMatchObject({
      id: originalPost.id,
      txId: "arweave-tx-edit-1",
      title: "Edited Post Title",
      content: "Edited content",
      revisionsCount: 2,
    });

    // Verify PostRevision entry was created
    const revisions = await testDb.db.postRevision.findMany({
      where: { postId: originalPost.id },
      orderBy: { createdAt: "asc" },
    });

    expect(revisions.map((r) => r.txId)).toStrictEqual([
      "original-post-id",
      "arweave-tx-edit-1",
    ]);
  });

  it("passes mainnet network option to verifyMetadataSignature when STACKS_ENV is mainnet", async () => {
    mockStacksEnv = "mainnet";

    const user = await createTestUser({ id: userId });
    await createTestDraft({
      id: "draft-mainnet",
      userId: user.id,
      title: "Mainnet Draft",
    });

    mockGetRouterParam.mockReturnValue("draft-mainnet");

    const mockMetadata = {
      $schema: "https://json-schemas.sigle.io/posts/1.0.0.json",
      content: {
        id: "draft-mainnet",
        title: "Mainnet Draft Title",
        content: "Draft content",
      },
    };

    mockReadValidatedBodyZod.mockResolvedValue({
      type: "draft",
      metadata: mockMetadata,
    });

    vi.mocked(verifyMetadataSignature).mockReturnValue(
      Result.ok({
        recoveredAddress: userId,
        publicKey: "pubkey-mainnet",
        signature: "sig-mainnet",
      }),
    );

    vi.mocked(arweaveUploadFile).mockResolvedValue(
      Result.ok({ id: "arweave-tx-mainnet" }),
    );

    const mockEvent = new H3Event(
      new Request(
        "http://localhost/api/protected/drafts/draft-mainnet/upload-metadata",
      ),
    );

    mockEvent.context.user = { id: userId };
    mockEvent.context.$posthog = createMockPosthog();

    await handler(mockEvent);

    expect(verifyMetadataSignature).toHaveBeenCalledWith(mockMetadata, {
      network: "mainnet",
    });
  });

  it("passes testnet network option to verifyMetadataSignature when STACKS_ENV is a non-mainnet value", async () => {
    mockStacksEnv = "testnet";

    const user = await createTestUser({ id: userId });
    await createTestDraft({
      id: "draft-testnet",
      userId: user.id,
      title: "Testnet Draft",
    });

    mockGetRouterParam.mockReturnValue("draft-testnet");

    const mockMetadata = {
      $schema: "https://json-schemas.sigle.io/posts/1.0.0.json",
      content: {
        id: "draft-testnet",
        title: "Testnet Draft Title",
        content: "Draft content",
      },
    };

    mockReadValidatedBodyZod.mockResolvedValue({
      type: "draft",
      metadata: mockMetadata,
    });

    vi.mocked(verifyMetadataSignature).mockReturnValue(
      Result.ok({
        recoveredAddress: userId,
        publicKey: "pubkey-testnet",
        signature: "sig-testnet",
      }),
    );

    vi.mocked(arweaveUploadFile).mockResolvedValue(
      Result.ok({ id: "arweave-tx-testnet" }),
    );

    const mockEvent = new H3Event(
      new Request(
        "http://localhost/api/protected/drafts/draft-testnet/upload-metadata",
      ),
    );

    mockEvent.context.user = { id: userId };
    mockEvent.context.$posthog = createMockPosthog();

    await handler(mockEvent);

    expect(verifyMetadataSignature).toHaveBeenCalledWith(mockMetadata, {
      network: "testnet",
    });
  });
});
