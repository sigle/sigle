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
import { isUserWhitelisted } from "~/lib/users";
import { createTestDatabase, type TestDatabase } from "~/test/database";
import { createTestDraft, createTestUser } from "~/test/helpers";

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitro")>(import("nitro"), () => ({
  defineRouteMeta: vi.fn(),
}));

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("~/lib/users")>(import("~/lib/users"), () => ({
  isUserWhitelisted: vi.fn().mockReturnValue(true),
}));

const mockGetValidatedQueryZod = vi.fn();

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("~/lib/nitro")>(import("~/lib/nitro"), () => ({
  getValidatedQueryZod: (...args: unknown[]) =>
    mockGetValidatedQueryZod(...args),
}));

const { default: handler } = await import("./list.get");

describe("api/protected/drafts/list.get", () => {
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

  it("returns list of drafts", async () => {
    const user = await createTestUser({ id: userId });
    await createTestDraft({ id: "draft-1", userId: user.id, title: "Draft 1" });
    await createTestDraft({ id: "draft-2", userId: user.id, title: "Draft 2" });

    mockGetValidatedQueryZod.mockResolvedValue({ limit: 10 });

    const mockEvent = {
      context: { user: { id: userId } },
      path: "/api/protected/drafts",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toHaveLength(2);
  });

  it("returns empty list when no drafts", async () => {
    await createTestUser({ id: userId });

    mockGetValidatedQueryZod.mockResolvedValue({ limit: 10 });

    const mockEvent = {
      context: { user: { id: userId } },
      path: "/api/protected/drafts",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toHaveLength(0);
  });

  it("respects limit parameter", async () => {
    const user = await createTestUser({ id: userId });
    await createTestDraft({ id: "draft-1", userId: user.id, title: "Draft 1" });
    await createTestDraft({ id: "draft-2", userId: user.id, title: "Draft 2" });
    await createTestDraft({ id: "draft-3", userId: user.id, title: "Draft 3" });

    mockGetValidatedQueryZod.mockResolvedValue({ limit: 2 });

    const mockEvent = {
      context: { user: { id: userId } },
      path: "/api/protected/drafts",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toHaveLength(2);
  });

  it("returns 403 when user is not whitelisted", async () => {
    vi.mocked(isUserWhitelisted).mockReturnValueOnce(false);

    mockGetValidatedQueryZod.mockResolvedValue({ limit: 10 });

    const mockEvent = {
      context: { user: { id: userId } },
      path: "/api/protected/drafts",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    await expect(handler(mockEvent)).rejects.toThrow("User is not whitelisted");
  });
});
