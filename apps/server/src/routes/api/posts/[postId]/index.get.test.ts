import type { H3Event } from "h3";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { createTestDatabase, type TestDatabase } from "~/test/database";
import { createTestPost, createTestUser } from "~/test/helpers";

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitropack/runtime")>(
  import("nitropack/runtime"),
  () => ({
    defineRouteMeta: vi.fn(),
  }),
);

const mockGetRouterParam = vi.fn((event: H3Event, name: string) => {
  if (name === "postId") {
    return (event as unknown as { postId?: string }).postId ?? undefined;
  }
  return undefined;
});

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("h3")>(import("h3"), async () => {
  const actual = await vi.importActual("h3");
  return {
    ...actual,
    getRouterParam: mockGetRouterParam,
  };
});

const { default: handler } = await import("./index.get");

describe("api/posts/[postId]/index.get", () => {
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

  it("returns post by id", async () => {
    const user = await createTestUser({ id: userId });
    const post = await createTestPost({
      id: "post-1",
      userId: user.id,
      title: "Test Post",
    });

    mockGetRouterParam.mockReturnValue("post-1");

    const mockEvent = {
      context: {},
      path: "/api/posts/post-1",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toMatchObject({
      id: post.id,
      title: "Test Post",
      collectorsCount: 0,
    });
  });

  it("returns 400 when postId is missing", async () => {
    mockGetRouterParam.mockReturnValue(undefined);

    const mockEvent = {
      context: {},
      path: "/api/posts/",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    await expect(handler(mockEvent)).rejects.toThrow("Bad Request");
  });

  it("returns 404 when post not found", async () => {
    mockGetRouterParam.mockReturnValue("non-existent-post");

    const mockEvent = {
      context: {},
      path: "/api/posts/non-existent-post",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toStrictEqual({ collectorsCount: 0 });
  });

  it("returns collectors count", async () => {
    const user = await createTestUser({ id: userId });
    const post = await createTestPost({
      id: "post-1",
      userId: user.id,
      title: "Test Post",
    });

    // Create NFT with a different minter
    const minter1 = await createTestUser({ id: "minter1" });

    await testDb.db.postNft.create({
      data: {
        id: "nft-1",
        postId: post.id,
        ownerId: minter1.id,
        minterId: minter1.id,
        createdAt: new Date(),
      },
    });

    mockGetRouterParam.mockReturnValue("post-1");

    const mockEvent = {
      context: {},
      path: "/api/posts/post-1",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result?.collectorsCount).toBe(1);
  });
});
