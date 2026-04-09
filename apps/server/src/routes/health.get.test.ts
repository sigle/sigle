// import { e2eFetch, resetTestDb } from "@/test/e2e";
import { $fetchRaw } from "nitro-test-utils/e2e";
import { describe, expect, it } from "vitest";

describe("health.get", () => {
  it("returns success true", async () => {
    const { data, status } = await $fetchRaw("/health");

    expect(status).toBe(200);
    expect(data).toStrictEqual({ success: true });
  });
});
