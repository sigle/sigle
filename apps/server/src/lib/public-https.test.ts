import { describe, expect, it } from "vite-plus/test";
import { fetchPublicHttps } from "@/lib/public-https";

describe("fetchPublicHttps", () => {
  // `localhost` passes as a hostname but resolves to loopback addresses, as
  // a public name pointed at a private address would.
  it("refuses a hostname that resolves to a blocked address", async () => {
    await expect(
      fetchPublicHttps(new URL("https://localhost:9/"), {
        signal: AbortSignal.timeout(5000),
      }),
    ).rejects.toMatchObject({
      _tag: "BlockedAddressError",
      hostname: "localhost",
    });
  });
});
