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
import { createTestUser } from "~/test/helpers";

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitropack/runtime")>(
  import("nitropack/runtime"),
  () => ({
    defineRouteMeta: vi.fn(),
  }),
);

vi.mock("~/lib/users", () => ({
  isUserWhitelisted: vi.fn().mockReturnValue(true),
}));

vi.mock("~/lib/nitro", () => ({
  readValidatedBodyZod: vi.fn(),
}));

vi.mock("~/env", () => ({
  env: {
    STACKS_ENV: "testnet",
  },
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

    const mockReadBody = vi.mocked(vi.fn()).mockResolvedValue({});
    vi.mock<typeof import("~/lib/nitro")>(import("~/lib/nitro"), () => ({
      readValidatedBodyZod: mockReadBody,
    }));

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
