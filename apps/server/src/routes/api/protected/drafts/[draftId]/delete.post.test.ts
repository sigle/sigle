import { H3Event, type getRouterParam } from "nitro/h3";
import { PostHog } from "posthog-node";
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
import { createTestDraft, createTestUser } from "@/test/helpers";

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

const { default: handler } = await import("./delete.post");

describe("api/protected/drafts/[draftId]/delete.post", () => {
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

  it("deletes a draft", async () => {
    const user = await createTestUser({ id: userId });
    await createTestDraft({
      id: "draft-1",
      userId: user.id,
      title: "To Delete",
    });

    mockGetRouterParam.mockReturnValue("draft-1");

    const mockEvent = new H3Event(
      new Request("http://localhost/api/protected/drafts/draft-1/delete"),
    );

    const posthog = new PostHog("test-api-key", { host: "http://localhost" });

    vi.spyOn(posthog, "capture").mockReturnValue(undefined);
    mockEvent.context.user = { id: userId };
    mockEvent.context.$posthog = posthog;

    const result = await handler(mockEvent);

    expect(result).toBe(true);

    // Verify DB was deleted
    const deletedDraft = await testDb.db.draft.findUnique({
      where: { id: "draft-1" },
    });

    expect(deletedDraft).toBeNull();
  });
});
