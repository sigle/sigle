// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

// openapi-fetch captures `fetch` when the client is created, so stub it
// before importing the route module graph afresh.
const callRoute = async (respond: (path: string) => Response) => {
  vi.stubGlobal("fetch", async (input: Request) =>
    respond(new URL(input.url).pathname),
  );
  vi.resetModules();
  const { GET } = await import("./route");

  return GET(new Request("http://localhost/api/feed/SP1"), {
    params: Promise.resolve({ username: "SP1" }),
  });
};

describe("rss feed route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 404 when the API does not know the user", async () => {
    const response = await callRoute(() =>
      Response.json({ message: "User not found" }, { status: 404 }),
    );

    expect(response.status).toBe(404);
  });

  it("returns 404 when the API rejects the address", async () => {
    const response = await callRoute(() =>
      Response.json({ message: "Invalid address" }, { status: 400 }),
    );

    expect(response.status).toBe(404);
  });

  it("returns 500 when the API fails", async () => {
    const response = await callRoute(() =>
      Response.json({ message: "boom" }, { status: 500 }),
    );

    expect(response.status).toBe(500);
  });

  it("returns the RSS feed when the user exists", async () => {
    const bodies = new Map([
      ["/api/users/SP1", { address: "SP1", profile: null }],
      ["/api/posts", { results: [], limit: 100, offset: 0, total: 0 }],
    ]);

    const response = await callRoute((path) =>
      Response.json(bodies.get(path), { status: 200 }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain(
      "application/rss+xml",
    );
  });
});
