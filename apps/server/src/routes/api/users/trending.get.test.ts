import { beforeEach, describe, expect, it } from "vitest";
import {
  createTestPost,
  createTestUser,
  e2eFetch,
  resetTestDb,
} from "@/test/e2e";

describe("api/users/trending.get", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  it("returns trending users with posts", async () => {
    const user1 = await createTestUser({ id: "user1" });
    const user2 = await createTestUser({ id: "user2" });
    await createTestPost({
      id: "post-1",
      userId: (user1 as Record<string, unknown>).id as string,
      title: "Post 1",
    });
    await createTestPost({
      id: "post-2",
      userId: (user2 as Record<string, unknown>).id as string,
      title: "Post 2",
    });

    const { data, status } = await e2eFetch("/api/users/trending");

    expect(status).toBe(200);
    expect(data).toHaveLength(2);
  });

  it("returns empty array when no users have posts", async () => {
    await createTestUser({ id: "user1" });
    await createTestUser({ id: "user2" });

    const { data, status } = await e2eFetch("/api/users/trending");

    expect(status).toBe(200);
    expect(data).toHaveLength(0);
  });

  it("returns users with their post counts", async () => {
    const user = await createTestUser({ id: "user1" });
    await createTestPost({
      id: "post-1",
      userId: (user as Record<string, unknown>).id as string,
      title: "Post 1",
    });
    await createTestPost({
      id: "post-2",
      userId: (user as Record<string, unknown>).id as string,
      title: "Post 2",
    });

    const { data, status } = await e2eFetch("/api/users/trending");

    expect(status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0]).toHaveProperty("postsCount", 2);
  });
});
