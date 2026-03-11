import type { H3Event } from "nitro/h3";
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
vi.mock<typeof import("nitro")>(import("nitro"), () => ({
  defineRouteMeta: vi.fn(),
}));

const mockGetRouterParam = vi.fn((event: unknown, name: string) => {
  if (name === "username") {
    return (event as { username?: string }).username ?? undefined;
  }
  return undefined;
});

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitro/h3")>(import("nitro/h3"), async () => {
  const actual = await vi.importActual("nitro/h3");
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

  it("returns user profile", async () => {
    mockGetRouterParam.mockReturnValue(userId);

    await createTestUser({
      id: userId,
      profile: {
        displayName: "Test User",
        description: "Test description",
        website: "https://example.com",
        twitter: "testuser",
      },
    });

    await createTestPost({ id: "post-1", userId, title: "Test Post" });
    await createTestPost({ id: "post-2", userId, title: "Test Post 2" });

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
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
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
});
