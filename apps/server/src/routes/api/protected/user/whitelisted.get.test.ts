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
import { isUserWhitelisted } from "@/lib/users";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { createTestUser } from "@/test/helpers";

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitro")>(import("nitro"), () => ({
  defineRouteMeta: vi.fn(),
}));

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("@/lib/users")>(import("@/lib/users"), () => ({
  isUserWhitelisted: vi.fn().mockReturnValue(true),
}));

const { default: handler } = await import("./whitelisted.get");

describe("api/protected/user/whitelisted.get", () => {
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

  it("returns whitelisted true for whitelisted user", async () => {
    await createTestUser({ id: userId });

    vi.mocked(isUserWhitelisted).mockReturnValue(true);

    const mockEvent = {
      context: { user: { id: userId } },
      path: "/api/protected/user/whitelisted",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toStrictEqual({ whitelisted: true });
  });

  it("returns whitelisted false for non-whitelisted user", async () => {
    await createTestUser({ id: userId });

    vi.mocked(isUserWhitelisted).mockReturnValue(false);

    const mockEvent = {
      context: { user: { id: userId } },
      path: "/api/protected/user/whitelisted",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result).toStrictEqual({ whitelisted: false });
  });
});
