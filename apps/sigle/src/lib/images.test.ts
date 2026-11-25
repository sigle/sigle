import { describe, expect, it } from "vite-plus/test";
import { resolveImageUrl } from "./images";

describe(resolveImageUrl, () => {
  it("converts a valid v0 CID to v1", () => {
    expect(
      resolveImageUrl("ipfs://QmY7Yh4UquoXHLPFo2XbhXkhBvFoPwmQUSa92pxnxjQuPU"),
    ).toBe(
      "https://ipfs.filebase.io/ipfs/bafybeierhgbz4zp2x2u67urqrgfnrnlukciupzenpqpipiz5nwtq7uxpx4",
    );
  });

  it("keeps an invalid CID as written instead of throwing", () => {
    expect(resolveImageUrl("ipfs://QmNotAValidCid")).toBe(
      "https://ipfs.filebase.io/ipfs/QmNotAValidCid",
    );
  });

  it("keeps a truncated CID as written when using the gateway option", () => {
    expect(resolveImageUrl("ipfs://Qm", { gateway: true })).toBe(
      "https://ipfs.filebase.io/ipfs/Qm",
    );
  });

  it("resolves arweave URLs", () => {
    expect(resolveImageUrl("ar://abc123")).toBe(
      "https://turbo-gateway.com/abc123",
    );
  });

  it("leaves http URLs unchanged", () => {
    expect(resolveImageUrl("https://example.com/a.png")).toBe(
      "https://example.com/a.png",
    );
  });
});
