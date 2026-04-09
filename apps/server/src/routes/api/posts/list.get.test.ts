import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { e2eFetch, resetTestDb } from "@/test/e2e";
import { createTestPost, createTestUser } from "@/test/e2e";

describe("api/posts/list.get", () => {
  const userId = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

  beforeEach(async () => {
    await resetTestDb();
  });

  it("returns paginated list of posts", async () => {
    await createTestUser({ id: userId });
    await createTestPost({ id: "post-1", userId, title: "First Post" });
    await createTestPost({ id: "post-2", userId, title: "Second Post" });

    const { data, status } = await e2eFetch(
      "/api/posts/list?limit=10&offset=0",
    );

    expect(status).toBe(200);
    expect(data.limit).toBe(10);
    expect(data.offset).toBe(0);
    expect(data.total).toBe(2);
    expect(data.results).toHaveLength(2);
  });

  it("returns posts filtered by username", async () => {
    const user1 = await createTestUser({ id: "user1" });
    const user2 = await createTestUser({ id: "user2" });
    await createTestPost({
      id: "post-1",
      userId: (user1 as Record<string, unknown>).id as string,
      title: "User1 Post",
    });
    await createTestPost({
      id: "post-2",
      userId: (user2 as Record<string, unknown>).id as string,
      title: "User2 Post",
    });

    const { data, status } = await e2eFetch(
      `/api/posts/list?limit=10&offset=0&username=${(user1 as Record<string, unknown>).id}`,
    );

    expect(status).toBe(200);
    expect(data.total).toBe(1);
    expect(data.results).toHaveLength(1);
    expect(data.results[0]?.title).toBe("User1 Post");
  });

  it("respects pagination parameters", async () => {
    await createTestUser({ id: userId });
    await createTestPost({ id: "post-1", userId, title: "First Post" });
    await createTestPost({ id: "post-2", userId, title: "Second Post" });
    await createTestPost({ id: "post-3", userId, title: "Third Post" });

    const { data, status } = await e2eFetch("/api/posts/list?limit=2&offset=1");

    expect(status).toBe(200);
    expect(data.limit).toBe(2);
    expect(data.offset).toBe(1);
    expect(data.total).toBe(3);
    expect(data.results).toHaveLength(2);
  });

  it("returns empty list when no posts", async () => {
    const { data, status } = await e2eFetch(
      "/api/posts/list?limit=10&offset=0",
    );

    expect(status).toBe(200);
    expect(data.total).toBe(0);
    expect(data.results).toHaveLength(0);
  });
});
