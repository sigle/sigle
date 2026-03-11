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

vi.mock<typeof import("nitropack/runtime")>(
  import("nitropack/runtime"),
  () => ({
    defineRouteMeta: vi.fn(),
  }),
);

const mockGetRouterParam = vi.fn((event: H3Event, name: string) => {
  if (name === "username") {
    return (event as unknown as { username?: string }).username ?? undefined;
  }
  return undefined;
});

vi.mock<typeof import("h3")>(import("h3"), async () => {
  const actual = await vi.importActual("h3");
  return {
    ...actual,
    getRouterParam: mockGetRouterParam,
  };
});

const { default: handler } = await import("./index.get");

describe("api/users/[username]/index.get", () => {
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

  it("returns user profile", async () => {
    mockGetRouterParam.mockReturnValue(userId);

    const now = new Date();
    await testDb.db.user.create({
      data: {
        id: userId,
        flag: "NONE",
        createdAt: now,
        updatedAt: now,
        profile: {
          create: {
            displayName: "Test User",
            description: "Test description",
            website: "https://example.com",
            twitter: "testuser",
            createdAt: now,
            updatedAt: now,
          },
        },
        posts: {
          create: [
            {
              id: "post-1",
              version: "1.0.0",
              txId: "0x123",
              title: "Test Post",
              content: "Test content",
              excerpt: "Test excerpt",
              metadataUri: "ipfs://QmTest1",
              createdAt: now,
              updatedAt: now,
            },
            {
              id: "post-2",
              version: "1.0.0",
              txId: "0x456",
              title: "Test Post 2",
              content: "Test content 2",
              excerpt: "Test excerpt 2",
              metadataUri: "ipfs://QmTest2",
              createdAt: now,
              updatedAt: now,
            },
          ],
        },
      },
    });

    const mockEvent = {
      context: {},
      path: "/api/users/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toStrictEqual({
      id: userId,
      flag: "NONE",
      createdAt: now,
      updatedAt: now,
      postsCount: 2,
      _count: undefined,
      profile: {
        id: userId,
        displayName: "Test User",
        description: "Test description",
        website: "https://example.com",
        twitter: "testuser",
        pictureUri: null,
        coverPictureUri: null,
      },
    });
  });

  it("returns 400 when username is missing", async () => {
    mockGetRouterParam.mockReturnValue(undefined);

    const mockEvent = {
      context: {},
      path: "/api/users/",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    await expect(handler(mockEvent)).rejects.toThrow("Bad Request");
  });

  it("returns 404 when user not found", async () => {
    mockGetRouterParam.mockReturnValue(
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZ99",
    );

    const mockEvent = {
      context: {},
      path: "/api/users/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZ99",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    await expect(handler(mockEvent)).rejects.toThrow("User not found");
  });
});
