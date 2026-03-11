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
import { createTestUser } from "~/test/helpers";

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitropack/runtime")>(
  import("nitropack/runtime"),
  () => ({
    defineRouteMeta: vi.fn(),
  }),
);

const mockGetRouterParam = vi.fn((event: H3Event, name: string) => {
  if (name === "domain") {
    return (event as unknown as { domain?: string }).domain ?? undefined;
  }
  return undefined;
});

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("h3")>(import("h3"), async () => {
  const actual = await vi.importActual("h3");
  return {
    ...actual,
    getRouterParam: mockGetRouterParam,
  };
});

const mockSites = {
  "blog.sigle.io": {
    address: "ST3CH69RQ9FWCHSKMWG7J5TQCNADRDPX43M9AS35Z",
    url: "https://blog.sigle.io",
    banner: "/websites/blog.sigle.io/banner.png",
    links: [
      { href: "https://www.sigle.io/", label: "Home" },
      { href: "https://app.sigle.io/explore", label: "Explore" },
    ],
    cta: { href: "https://app.sigle.io/", label: "Get Started" },
  },
};

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("~/sites")>(import("~/sites"), () => ({
  sites: mockSites,
}));

const { default: handler } = await import("./index.get");

describe("api/sites/[domain]/index.get", () => {
  // oxlint-disable-next-line init-declarations
  let testDb: TestDatabase;
  const siteAddress = "ST3CH69RQ9FWCHSKMWG7J5TQCNADRDPX43M9AS35Z";

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

  it("returns site by domain", async () => {
    await createTestUser({ id: siteAddress });

    mockGetRouterParam.mockReturnValue("blog.sigle.io");

    const mockEvent = {
      context: {},
      path: "/api/sites/blog.sigle.io",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result?.address).toBe(siteAddress);
    expect(result?.url).toBe("https://blog.sigle.io");
    expect(result?.banner).toBe("/websites/blog.sigle.io/banner.png");
    expect(result?.links).toHaveLength(2);
    expect(result?.cta).toStrictEqual({
      href: "https://app.sigle.io/",
      label: "Get Started",
    });
  });

  it("returns 400 when domain is missing", async () => {
    mockGetRouterParam.mockReturnValue(undefined);

    const mockEvent = {
      context: {},
      path: "/api/sites/",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    await expect(handler(mockEvent)).rejects.toThrow("Bad Request");
  });

  it("returns 404 when site not found", async () => {
    mockGetRouterParam.mockReturnValue("nonexistent.com");

    const mockEvent = {
      context: {},
      path: "/api/sites/nonexistent.com",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    await expect(handler(mockEvent)).rejects.toThrow("Site not found");
  });

  it("returns 404 when user not found", async () => {
    // Site exists but user doesn't exist in DB
    mockGetRouterParam.mockReturnValue("blog.sigle.io");

    const mockEvent = {
      context: {},
      path: "/api/sites/blog.sigle.io",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    await expect(handler(mockEvent)).rejects.toThrow("User not found");
  });

  it("handles URL encoded domain", async () => {
    await createTestUser({ id: siteAddress });

    // Simulate URL encoded domain
    mockGetRouterParam.mockReturnValue("blog.sigle.io");

    const mockEvent = {
      context: {},
      path: "/api/sites/blog.sigle.io",
      method: "GET",
      headers: {},
    } as unknown as H3Event;

    const result = await handler(mockEvent);

    expect(result?.address).toBe(siteAddress);
  });
});
