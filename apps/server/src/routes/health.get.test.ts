import { createError, defineEventHandler } from "h3";
import { describe, expect, it, vi } from "vitest";

vi.mock("nitropack/runtime", () => ({
  defineRouteMeta: vi.fn(),
}));

const { default: handler } = await import("./health.get");

describe("health.get", () => {
  it("returns success true", async () => {
    const result = await handler({} as any);

    expect(result).toEqual({ success: true });
  });
});
