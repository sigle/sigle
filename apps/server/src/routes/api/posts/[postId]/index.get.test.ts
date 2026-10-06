import { H3Event, type getRouterParam } from "nitro/h3";
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

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitro")>(import("nitro"), () => ({
  defineRouteMeta: vi.fn(),
}));

const { mockGetRouterParam } = vi.hoisted(() => ({
  mockGetRouterParam: vi.fn<typeof getRouterParam>(),
}));

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitro/h3")>(import("nitro/h3"), async () => {
  const actual = await vi.importActual("nitro/h3");

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

    const mockEvent = new H3Event(
      new Request("http://localhost/api/posts/post-1"),
    );

    const result = await handler(mockEvent);

    expect(result).toMatchObject({
      id: post.id,
      title: "Test Post",
    });
  });

  it("returns 400 when postId is missing", async () => {
    mockGetRouterParam.mockReturnValue(undefined);

    const mockEvent = new H3Event(new Request("http://localhost/api/posts/"));

    await expect(handler(mockEvent)).rejects.toThrow("Bad Request");
  });

  it("returns 404 when post not found", async () => {
    mockGetRouterParam.mockReturnValue("non-existent-post");

    const mockEvent = new H3Event(
      new Request("http://localhost/api/posts/non-existent-post"),
    );

    const result = await handler(mockEvent);

    expect(result).toBeNull();
  });
});
