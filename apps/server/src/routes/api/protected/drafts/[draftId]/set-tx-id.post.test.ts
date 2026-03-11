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
import { createTestDatabase, type TestDatabase } from "~/test/database";
import { createTestDraft, createTestUser } from "~/test/helpers";

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitropack/runtime")>(
  import("nitropack/runtime"),
  () => ({
    defineRouteMeta: vi.fn(),
  }),
);

vi.mock<typeof import("~/lib/stacks")>(
  import("~/lib/stacks"),
  () =>
    ({
      stacksApiClient: {
        GET: vi.fn().mockResolvedValue({ data: { tx_id: "0x123" } }),
      },
    }) as unknown as typeof import("~/lib/stacks"),
);

const mockReadValidatedBodyZod = vi.fn();

vi.mock<typeof import("~/lib/nitro")>(import("~/lib/nitro"), () => ({
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

const { default: handler } = await import("./set-tx-id.post");

describe("api/protected/drafts/[draftId]/set-tx-id.post", () => {
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

  it("sets tx id on draft", async () => {
    const user = await createTestUser({ id: userId });
    await createTestDraft({ id: "draft-1", userId: user.id, title: "Test" });

    mockReadValidatedBodyZod.mockResolvedValue({
      txId: "0xabc123",
    });
    mockGetRouterParam.mockReturnValue("draft-1");

    const mockEvent = {
      context: {
        user: { id: userId },
        $posthog: { capture: vi.fn() },
      },
      path: "/api/protected/drafts/draft-1/set-tx-id",
      method: "POST",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toBeTruthy();

    // Verify DB was updated
    const updatedDraft = await testDb.db.draft.findUnique({
      where: { id: "draft-1" },
    });
    expect(updatedDraft).toMatchObject({
      txId: "0xabc123",
      txStatus: "pending",
    });
  });
});
