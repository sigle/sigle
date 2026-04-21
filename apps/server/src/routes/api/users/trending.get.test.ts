import { $fetchRaw } from "nitro-test-utils/e2e";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { createTestPost, createTestUser } from "@/test/helpers";

describe("api/users/trending.get", () => {
  // oxlint-disable-next-line init-declarations
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  beforeEach(async () => {
    await testDb.cleanup();
  });

  afterAll(async () => {
    await testDb.close();
  });

  it("returns trending users with posts", async () => {
    const user1 = await createTestUser({ id: "user1" });
    const user2 = await createTestUser({ id: "user2" });
    await createTestPost({
      id: "post-1",
      userId: user1.id,
      title: "Post 1",
    });
    await createTestPost({
      id: "post-2",
      userId: user2.id,
      title: "Post 2",
    });

    const { data, status } = await $fetchRaw("/api/users/trending");

    expect(status).toBe(200);
    expect(data).toHaveLength(2);
  });

  it("returns empty array when no users have posts", async () => {
    await createTestUser({ id: "user1" });
    await createTestUser({ id: "user2" });

    const { data, status } = await $fetchRaw("/api/users/trending");

    expect(status).toBe(200);
    expect(data).toHaveLength(0);
  });

  it("returns users with their post counts", async () => {
    const user = await createTestUser({ id: "user1" });
    await createTestPost({
      id: "post-1",
      userId: user.id,
      title: "Post 1",
    });
    await createTestPost({
      id: "post-2",
      userId: user.id,
      title: "Post 2",
    });

    const { data, status } = await $fetchRaw("/api/users/trending");

    expect(status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0]).toHaveProperty("postsCount", 2);
  });
});
