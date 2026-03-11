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
    defineCachedEventHandler: vi.fn((handler) => handler),
  }),
);

const { default: handler } = await import("./trending.get");

describe("api/users/trending.get", () => {
  // oxlint-disable-next-line init-declarations
  let testDb: TestDatabase;

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

  it("returns trending users with posts", async () => {
    const user1 = await createTestUser({ id: "user1" });
    const user2 = await createTestUser({ id: "user2" });

    await createTestPost({ id: "post-1", userId: user1.id, title: "Post 1" });
    await createTestPost({ id: "post-2", userId: user2.id, title: "Post 2" });

    const mockEvent = {
      context: {},
      path: "/api/users/trending",
      method: "GET",
      headers: {},
    } as unknown as Parameters<typeof handler>[0];

    const result = await handler(mockEvent);

    expect(result).toHaveLength(2);
  });

  it("returns empty array when no users have posts", async () => {
    await createTestUser({ id: "user1" });
    await createTestUser({ id: "user2" });

    const mockEvent = {
      context: {},
      path: "/api/users/trending",
      method: "GET",
      headers: {},
    } as unknown as Parameters<typeof handler>[0];

    const result = await handler(mockEvent);

    expect(result).toHaveLength(0);
  });

  it("returns users with their post counts", async () => {
    const user = await createTestUser({ id: "user1" });

    await createTestPost({ id: "post-1", userId: user.id, title: "Post 1" });
    await createTestPost({ id: "post-2", userId: user.id, title: "Post 2" });

    const mockEvent = {
      context: {},
      path: "/api/users/trending",
      method: "GET",
      headers: {},
    } as unknown as Parameters<typeof handler>[0];

    const result = await handler(mockEvent);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("postsCount", 2);
  });
});
