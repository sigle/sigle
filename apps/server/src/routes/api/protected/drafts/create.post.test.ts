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
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { createTestUser } from "@/test/helpers";

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitro")>(import("nitro"), () => ({
  defineRouteMeta: vi.fn(),
  readValidatedBodyZod: vi.fn(),
}));

const mockGetValidatedQueryZod = vi.fn();

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("@/lib/nitro")>(import("@/lib/nitro"), () => ({
  getValidatedQueryZod: (...args: unknown[]) =>
    mockGetValidatedQueryZod(...args),
}));

const { default: handler } = await import("./create.post");

describe("api/protected/drafts/create.post", () => {
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

  it("creates a new draft", async () => {
    await createTestUser({ id: userId });

    mockGetValidatedQueryZod.mockResolvedValue({});

    const mockEvent = {
      context: {
        user: { id: userId },
        $posthog: {
          capture: vi.fn(),
        },
      },
      path: "/api/protected/drafts/create",
      method: "POST",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toHaveProperty("id");
  });
});
