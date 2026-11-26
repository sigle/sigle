// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

const TIMINGS = { timeoutMillis: 200, pollIntervalMillis: 10 };

// openapi-fetch captures `fetch` when the client is created, so stub it
// before importing the module graph afresh.
const waitWith = async (
  respond: (request: Request) => Response | Promise<Response>,
) => {
  const fetchMock = vi.fn(respond);
  vi.stubGlobal("fetch", fetchMock);
  vi.resetModules();

  const { waitForPublishCompletion } =
    await import("./wait-for-publish-completion");

  const result = await waitForPublishCompletion("d1", TIMINGS);

  return { result, fetchMock };
};

const status = (value: string) =>
  Response.json({ status: value, postId: null, arweaveTxId: null });

// Answers with each response in turn, then keeps answering "pending".
const sequence = (responses: Array<Response>) => () =>
  responses.shift() ?? status("pending");

type PublishResult = Awaited<ReturnType<typeof waitWith>>["result"];

const errorMessage = (result: PublishResult) =>
  result.isErr() ? result.error.message : undefined;

const okValue = (result: PublishResult) =>
  result.isOk() ? result.value : undefined;

describe("waitForPublishCompletion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("polls until the publish completes", async () => {
    const { result, fetchMock } = await waitWith(
      sequence([
        status("pending"),
        Response.json({
          status: "completed",
          postId: "tx1",
          arweaveTxId: "tx1",
        }),
      ]),
    );

    expect(result.isOk()).toBe(true);
    expect(okValue(result)).toStrictEqual({
      postId: "tx1",
      arweaveTxId: "tx1",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      new URL(fetchMock.mock.calls[0][0].url).pathname.endsWith(
        "/api/drafts/d1/publish",
      ),
    ).toBe(true);
  });

  it("fails when the publish failed", async () => {
    const { result } = await waitWith(() => status("failed"));

    expect(result.isErr()).toBe(true);
    expect(errorMessage(result)).toBe("Failed to publish post");
  });

  it("returns the API error message", async () => {
    const { result } = await waitWith(() =>
      Response.json({ message: "Draft not found" }, { status: 404 }),
    );

    expect(errorMessage(result)).toBe("Draft not found");
  });

  it("fails when the status request errors", async () => {
    const { result } = await waitWith(() => {
      throw new TypeError("network error");
    });

    expect(errorMessage(result)).toBe(
      "Failed to check the publishing status, please try again",
    );
  });

  it("times out when the publish never finishes", async () => {
    const { result } = await waitWith(() => status("processing"));

    expect(errorMessage(result)).toBe("Publishing timed out, please try again");
  });
});
