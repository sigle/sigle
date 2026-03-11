import type { H3Event } from "h3";
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

vi.mock("nitropack/runtime", () => ({
  defineRouteMeta: vi.fn(),
}));

vi.mock("~/lib/users", () => ({
  isUserWhitelisted: vi.fn().mockReturnValue(true),
}));

vi.mock(
  "~/env",
  () =>
    ({
      env: {
        STACKS_ENV: "testnet",
      },
    }) as any,
);

const mockReadValidatedBodyZod = vi.fn();

vi.mock("~/lib/nitro", () => ({
  readValidatedBodyZod: (...args: unknown[]) =>
    mockReadValidatedBodyZod(...args),
}));

const mockGetRouterParam = vi.fn((event: H3Event, name: string) => {
  if (name === "draftId") {
    return (event as unknown as { draftId?: string }).draftId ?? undefined;
  }
  return undefined;
});

vi.mock<typeof import("h3")>(import("h3"), async () => {
  const actual = await vi.importActual("h3");
  return {
    ...actual,
    getRouterParam: mockGetRouterParam,
  };
});

const { default: handler } = await import("./update.post");

describe("api/protected/drafts/[draftId]/update.post", () => {
  let testDb: TestDatabase;
  const userId = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  beforeEach(async () => {
    await testDb.cleanup();
    vi.clearAllMocks();
    vi.mocked(isUserWhitelisted).mockReturnValue(true);
  });

  afterAll(async () => {
    await testDb.close();
  });

  it("updates a draft", async () => {
    const user = await createTestUser({ id: userId });
    await createTestDraft({
      id: "draft-1",
      userId: user.id,
      title: "Old Title",
    });

    mockReadValidatedBodyZod.mockResolvedValue({
      title: "New Title",
      content: "New Content",
      collect: {
        collectPrice: { type: "free", price: 0 },
        collectLimit: { type: "open", limit: 100 },
      },
    });
    mockGetRouterParam.mockReturnValue("draft-1");

    const mockEvent = {
      context: {
        user: { id: userId },
        $posthog: { capture: vi.fn() },
      },
      path: "/api/protected/drafts/draft-1/update",
      method: "POST",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toHaveProperty("id", "draft-1");

    // Verify DB was updated
    const updatedDraft = await testDb.db.draft.findUnique({
      where: { id: "draft-1" },
    });
    expect(updatedDraft).toMatchObject({
      title: "New Title",
      content: "New Content",
      collectPriceType: "free",
      collectPrice: BigInt(0),
      collectLimitType: "open",
      collectLimit: 100,
    });
  });
});
