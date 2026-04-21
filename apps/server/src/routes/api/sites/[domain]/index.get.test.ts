import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { e2eFetch, resetTestDb } from "@/test/e2e";
import { createTestUser, initTestDatabase } from "@/test/helpers";

describe("api/sites/[domain]/index.get", () => {
  const siteAddress = "ST3CH69RQ9FWCHSKMWG7J5TQCNADRDPX43M9AS35Z";

  beforeAll(async () => {
    await initTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  it("returns site by domain", async () => {
    await createTestUser({ id: siteAddress });

    const { data, status } = await e2eFetch("/api/sites/blog.sigle.io");

    expect(status).toBe(200);
    expect(data).toMatchObject({
      address: siteAddress,
      url: "https://blog.sigle.io",
      banner: "/websites/blog.sigle.io/banner.png",
      links: [
        { href: "https://www.sigle.io/", label: "Home" },
        { href: "https://app.sigle.io/explore", label: "Explore" },
      ],
      cta: { href: "https://app.sigle.io/", label: "Get Started" },
    });
  });

  it("returns 404 when site not found", async () => {
    const { status } = await e2eFetch("/api/sites/nonexistent.com");

    expect(status).toBe(404);
  });

  it("returns 404 when user not found", async () => {
    const { status } = await e2eFetch("/api/sites/blog.sigle.io");

    expect(status).toBe(404);
  });
});
