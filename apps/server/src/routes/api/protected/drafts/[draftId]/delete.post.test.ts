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

vi.mock("~/env", () => ({
  env: {
    STACKS_ENV: "testnet",
  },
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

const { default: handler } = await import("./delete.post");

describe("api/protected/drafts/[draftId]/delete.post", () => {
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

  it("deletes a draft", async () => {
    const user = await createTestUser({ id: userId });
    await createTestDraft({
      id: "draft-1",
      userId: user.id,
      title: "To Delete",
    });

    mockGetRouterParam.mockReturnValue("draft-1");

    const mockEvent = {
      context: {
        user: { id: userId },
        $posthog: { capture: vi.fn() },
      },
      path: "/api/protected/drafts/draft-1/delete",
      method: "POST",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toBeTruthy();
  });
});
