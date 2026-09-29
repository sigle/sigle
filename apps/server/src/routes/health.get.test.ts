import { H3Event } from "nitro/h3";
import { describe, expect, it, vi } from "vite-plus/test";

// oxlint-disable-next-line consistent-type-imports
vi.mock<typeof import("nitro")>(import("nitro"), () => ({
  defineRouteMeta: vi.fn(),
}));

const { default: handler } = await import("./health.get");

describe("health.get", () => {
  it("returns success true", async () => {
    const mockEvent = new H3Event(new Request("http://localhost/health"));

    const result = handler(mockEvent);

    expect(result).toStrictEqual({ success: true });
  });
});
