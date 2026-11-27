import { describe, expect, it } from "vite-plus/test";
import { readLegacyJson } from "./read-legacy-json";

const fallback = "Failed to load your posts";

describe(readLegacyJson, () => {
  it("returns the parsed body of a successful response", async () => {
    const res = new Response('[{"id":"a"}]', { status: 200 });

    await expect(readLegacyJson(res, fallback)).resolves.toStrictEqual([
      { id: "a" },
    ]);
  });

  it("throws the proxy's message on an error status", async () => {
    const res = new Response('{"message":"User not found"}', { status: 404 });

    await expect(readLegacyJson(res, fallback)).rejects.toThrow(
      "User not found",
    );
  });

  it("throws the fallback when an error body has no message", async () => {
    const res = new Response('{"statusCode":500}', { status: 500 });

    await expect(readLegacyJson(res, fallback)).rejects.toThrow(fallback);
  });

  it("throws the fallback when the body isn't JSON", async () => {
    const res = new Response("not json", { status: 200 });

    await expect(readLegacyJson(res, fallback)).rejects.toThrow(fallback);
  });
});
