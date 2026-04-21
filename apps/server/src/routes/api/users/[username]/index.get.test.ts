import { beforeEach, describe, expect, it } from "vitest";
import {
  createTestPost,
  createTestUser,
  e2eFetch,
  resetTestDb,
} from "@/test/e2e";

describe("api/users/[username]/index.get", () => {
  const userId = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

  beforeEach(async () => {
    await resetTestDb();
  });

  it("returns 404 when username is missing", async () => {
    const { status } = await e2eFetch("/api/users/");

    expect(status).toBe(404);
  });

  it("returns 404 when user not found", async () => {
    const { status } = await e2eFetch(
      "/api/users/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZ99",
    );

    expect(status).toBe(404);
  });

  it("returns user profile", async () => {
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

    const { data, status } = await e2eFetch(`/api/users/${userId}`);

    expect(status).toBe(200);
    expect(data).toMatchObject({
      id: userId,
      flag: "NONE",
      postsCount: 2,
      profile: {
        id: userId,
        displayName: "Test User",
        description: "Test description",
        website: "https://example.com",
        twitter: "testuser",
      },
    });
  });
});
