// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { readLegacyJson } from "../../(dashboard)/dashboard/migration/read-legacy-json";

const stubFetch = (respond: () => Response | Promise<Response>) => {
  const urls: string[] = [];
  vi.stubGlobal("fetch", async (input: string) => {
    urls.push(input);

    return respond();
  });
  vi.resetModules();

  return urls;
};

const callList = async (query: string) => {
  const { GET } = await import("./list/route");

  return GET(new Request(`http://localhost/api/migration/list${query}`));
};

const callStory = async (id: string, username = "alice.btc") => {
  const { GET } = await import("./[id]/route");

  return GET(
    new Request(`http://localhost/api/migration/x?username=${username}`),
    { params: Promise.resolve({ id }) },
  );
};

describe("legacy migration proxy", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards a valid list request", async () => {
    const urls = stubFetch(() => Response.json([{ id: "a" }]));
    const response = await callList("?username=alice.btc");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual([{ id: "a" }]);
    expect(urls).toStrictEqual([
      "https://api.sigle.io/api/gaia/alice.btc/stories",
    ]);
  });

  it("rejects a path traversal username without fetching", async () => {
    const urls = stubFetch(() => Response.json([]));
    const response = await callList("?username=../admin");

    expect(response.status).toBe(400);
    expect(urls).toStrictEqual([]);
  });

  it("rejects a missing username with a message", async () => {
    stubFetch(() => Response.json([]));
    const response = await callList("");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toStrictEqual({
      message: expect.any(String),
    });
  });

  it("rejects a story id with a slash without fetching", async () => {
    const urls = stubFetch(() => Response.json({}));
    const response = await callStory("a/b");

    expect(response.status).toBe(400);
    expect(urls).toStrictEqual([]);
  });

  it("forwards an upstream 4xx with its message to readLegacyJson", async () => {
    stubFetch(() =>
      Response.json({ message: "User not found" }, { status: 404 }),
    );
    const response = await callList("?username=alice.btc");

    expect(response.status).toBe(404);
    await expect(response.clone().json()).resolves.toStrictEqual({
      message: "User not found",
    });
    await expect(readLegacyJson(response, "fallback")).rejects.toThrow(
      "User not found",
    );
  });

  it("answers 502 when the upstream body isn't JSON", async () => {
    stubFetch(() => new Response("<html>", { status: 200 }));
    const response = await callStory("abc");

    expect(response.status).toBe(502);
  });

  it("answers 502 when fetch throws", async () => {
    stubFetch(() => {
      throw new Error("network down");
    });
    const response = await callList("?username=alice.btc");

    expect(response.status).toBe(502);
  });

  it("answers 502 with the fallback message on an upstream 5xx", async () => {
    stubFetch(() => Response.json({ statusCode: 500 }, { status: 500 }));
    const response = await callList("?username=alice.btc");

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toStrictEqual({
      message: "The legacy API answered with an error",
    });
  });
});
