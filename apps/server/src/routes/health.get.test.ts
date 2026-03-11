import type { H3Event } from "h3";
import { describe, expect, it, vi } from "vitest";

vi.mock<typeof import("nitropack/runtime")>(
  import("nitropack/runtime"),
  () => ({
    defineRouteMeta: vi.fn(),
  }),
);

const { default: handler } = await import("./health.get");

describe("health.get", () => {
  it("returns success true", async () => {
    const result = await handler({} as H3Event);

    expect(result).toStrictEqual({ success: true });
  });
});
