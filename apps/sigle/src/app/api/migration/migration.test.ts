import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { GET as getStory } from "./[id]/route";
import { GET as listStories } from "./list/route";

const stubLegacyApi = (status: number, json: string) => {
  const fetchMock = vi.fn(
    async (_input: RequestInfo | URL) => new Response(json, { status }),
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
};

const list = (username: string) =>
  listStories(
    new Request(
      `https://sigle.test/api/migration/list?username=${encodeURIComponent(username)}`,
    ),
  );

const get = (id: string, username: string) =>
  getStory(
    new Request(
      `https://sigle.test/api/migration/x?username=${encodeURIComponent(username)}`,
    ),
    { params: Promise.resolve({ id }) },
  );

describe("migration proxy", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refuses parameters that would change the legacy API path", async () => {
    const fetchMock = stubLegacyApi(200, "[]");

    const responses = await Promise.all([
      list(""),
      list("../../api/admin"),
      list("sigle.btc/stories/x?"),
      list("sigle.btc#"),
      list("sigle"),
      get("eoROfiJRt5k_ysdNpo-tR", "../x"),
      get("../../../api/admin", "sigle.btc"),
      get("x/y", "sigle.btc"),
      get("x?y", "sigle.btc"),
    ]);

    expect({
      statuses: responses.map(({ status }) => status),
      fetches: fetchMock.mock.calls.length,
    }).toStrictEqual({ statuses: Array(9).fill(400), fetches: 0 });
  });

  it("proxies valid requests and keeps the legacy API status", async () => {
    const fetchMock = stubLegacyApi(
      500,
      JSON.stringify({ statusCode: 500, message: "Internal server error" }),
    );

    const listed = await list(" Name.ID.Stx ");
    const story = await get("eoROfiJRt5k_ysdNpo-tR", "sigle.btc");

    expect({
      urls: fetchMock.mock.calls.map(([url]) => String(url)),
      statuses: [listed.status, story.status],
      body: await listed.json(),
    }).toStrictEqual({
      urls: [
        "https://api.sigle.io/api/gaia/name.id.stx/stories",
        "https://api.sigle.io/api/gaia/sigle.btc/stories/eoROfiJRt5k_ysdNpo-tR",
      ],
      statuses: [500, 500],
      body: { statusCode: 500, message: "Internal server error" },
    });
  });
});
