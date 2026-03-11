import type { H3Event } from "nitro";
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
import {
  createTestDraft,
  createTestPost,
  createTestUser,
} from "~/test/helpers";

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitro")>(import("nitro"), () => ({
  defineRouteMeta: vi.fn(),
}));

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("~/lib/users")>(import("~/lib/users"), () => ({
  isUserWhitelisted: vi.fn().mockReturnValue(true),
}));

const mockGetRouterParam = vi.fn((event: unknown, name: string) => {
  if (name === "draftId") {
    return (event as { draftId?: string }).draftId ?? undefined;
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

const { default: handler } = await import("./[draftId].get");

describe("api/protected/drafts/[draftId].get", () => {
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

  it("returns draft by id", async () => {
    const user = await createTestUser({ id: userId });
    const draft = await createTestDraft({
      id: "draft-1",
      userId: user.id,
      title: "Test Draft",
    });

    mockGetRouterParam.mockReturnValue("draft-1");

    const mockEvent = {
      context: { user: { id: userId } },
      path: "/api/protected/drafts/draft-1",
      method: "GET",
      headers: {},
    } as unknown as H3Event<Request>;

    const result = await handler(mockEvent);

    expect(result).toMatchObject({
      id: draft.id,
      title: "Test Draft",
      type: "draft",
    });
  });

  it("returns 400 when draftId is missing", async () => {
    mockGetRouterParam.mockReturnValue(undefined);

    const mockEvent = {
      context: { user: { id: userId } },
      path: "/api/protected/drafts/",
      method: "GET",
      headers: {},
    } as unknown as H3Event<Request>;

    await expect(handler(mockEvent)).rejects.toThrow("Bad Request");
  });

  it("returns 404 when draft not found", async () => {
    mockGetRouterParam.mockReturnValue("non-existent");

    const mockEvent = {
      context: { user: { id: userId } },
      path: "/api/protected/drafts/non-existent",
      method: "GET",
      headers: {},
    } as unknown as H3Event<Request>;

    await expect(handler(mockEvent)).rejects.toThrow("Not Found");
  });

  it("returns published post when draft not found but post exists", async () => {
    const user = await createTestUser({ id: userId });
    await createTestPost({
      id: "post-1",
      userId: user.id,
      title: "Published Post",
    });

    mockGetRouterParam.mockReturnValue("post-1");

    const mockEvent = {
      context: { user: { id: userId } },
      path: "/api/protected/drafts/post-1",
      method: "GET",
      headers: {},
    } as unknown as H3Event<Request>;

    const result = await handler(mockEvent);

    expect(result).toMatchObject({
      id: "post-1",
      title: "Published Post",
      type: "published",
    });
  });
});
