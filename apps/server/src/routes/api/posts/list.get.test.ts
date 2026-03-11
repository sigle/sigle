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
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { createTestPost, createTestUser } from "@/test/helpers";

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitro")>(import("nitro"), () => ({
  defineRouteMeta: vi.fn(),
}));

const mockGetValidatedQueryZod = vi.fn();

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("@/lib/nitro")>(import("@/lib/nitro"), () => ({
  getValidatedQueryZod: (...args: unknown[]) =>
    mockGetValidatedQueryZod(...args),
}));

const { default: handler } = await import("./list.get");

describe("api/posts/list.get", () => {
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

  it("returns paginated list of posts", async () => {
    const user = await createTestUser({ id: userId });
    await createTestPost({
      id: "post-1",
      userId: user.id,
      title: "First Post",
    });
    await createTestPost({
      id: "post-2",
      userId: user.id,
      title: "Second Post",
    });

    mockGetValidatedQueryZod.mockResolvedValue({
      limit: 10,
      offset: 0,
    });

    const mockEvent = {
      context: {},
      path: "/api/posts",
      method: "GET",
      headers: {},
      query: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
    expect(result.total).toBe(2);
    expect(result.results).toHaveLength(2);
  });

  it("returns posts filtered by username", async () => {
    const user1 = await createTestUser({ id: "user1" });
    const user2 = await createTestUser({ id: "user2" });
    await createTestPost({
      id: "post-1",
      userId: user1.id,
      title: "User1 Post",
    });
    await createTestPost({
      id: "post-2",
      userId: user2.id,
      title: "User2 Post",
    });

    mockGetValidatedQueryZod.mockResolvedValue({
      limit: 10,
      offset: 0,
      username: user1.id,
    });

    const mockEvent = {
      context: {},
      path: "/api/posts",
      method: "GET",
      headers: {},
      query: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result.total).toBe(1);
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.title).toBe("User1 Post");
  });

  it("respects pagination parameters", async () => {
    const user = await createTestUser({ id: userId });
    await createTestPost({
      id: "post-1",
      userId: user.id,
      title: "First Post",
    });
    await createTestPost({
      id: "post-2",
      userId: user.id,
      title: "Second Post",
    });
    await createTestPost({
      id: "post-3",
      userId: user.id,
      title: "Third Post",
    });

    mockGetValidatedQueryZod.mockResolvedValue({
      limit: 2,
      offset: 1,
    });

    const mockEvent = {
      context: {},
      path: "/api/posts",
      method: "GET",
      headers: {},
      query: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result.limit).toBe(2);
    expect(result.offset).toBe(1);
    expect(result.total).toBe(3);
    expect(result.results).toHaveLength(2);
  });

  it("returns empty list when no posts", async () => {
    mockGetValidatedQueryZod.mockResolvedValue({
      limit: 10,
      offset: 0,
    });

    const mockEvent = {
      context: {},
      path: "/api/posts",
      method: "GET",
      headers: {},
      query: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result.total).toBe(0);
    expect(result.results).toHaveLength(0);
  });
});
