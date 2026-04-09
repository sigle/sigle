import { createNitroFetch } from "nitro-test-utils/e2e";

const $fetch = createNitroFetch();

export async function resetTestDb(): Promise<void> {
  const response = await $fetch("/api/internal/test-reset", { method: "POST" });
  if ((response as Record<string, unknown>).success !== true) {
    throw new Error("Failed to reset test database");
  }
}

interface CreateTestUserOptions {
  id?: string;
  profile?: {
    displayName?: string;
    description?: string;
    website?: string;
    twitter?: string;
    txId?: string;
  };
}

export async function createTestUser(options: CreateTestUserOptions = {}) {
  const response = await $fetch("/api/internal/test-api", {
    method: "POST",
    body: {
      operation: "createUser",
      data: {
        id: options.id,
        profile: options.profile,
      },
    },
  });
  return response as Record<string, unknown>;
}

interface CreateTestPostOptions {
  id?: string;
  userId: string;
  title?: string;
}

export async function createTestPost(options: CreateTestPostOptions) {
  const response = await $fetch("/api/internal/test-api", {
    method: "POST",
    body: {
      operation: "createPost",
      data: {
        id: options.id,
        userId: options.userId,
        title: options.title,
      },
    },
  });
  return response as Record<string, unknown>;
}

export async function e2eFetch<T = unknown>(
  path: string,
  options?: Record<string, unknown>,
): Promise<{ data: T; status: number }> {
  const response = await $fetch.raw(path, options);
  return {
    data: response._data as T,
    status: response.status,
  };
}
