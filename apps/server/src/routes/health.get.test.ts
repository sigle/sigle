import type { H3Event } from "h3";
import { describe, expect, it, vi } from "vitest";

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitropack/runtime")>(
  import("nitropack/runtime"),
  () => ({
    defineRouteMeta: vi.fn(),
  }),
);

const { default: handler } = await import("./health.get");

describe("health.get", () => {
  it("returns success true", async () => {
    const mockEvent = {} as unknown as H3Event;

    const result = handler(mockEvent);

    expect(result).toStrictEqual({ success: true });
  });
});
