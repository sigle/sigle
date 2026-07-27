import { describe, expect, it, vi } from "vite-plus/test";
import {
  BITCOIN_ATTESTATION_TAG,
  buildOtsFileBuffer,
  calculateSha256,
  isOtsProofUpgraded,
  parseOtsFileBuffer,
  stampWithFallback,
  upgradeOtsProof,
} from "./opentimestamps";

describe("openTimestamps native client", () => {
  it("calculates SHA-256 digest correctly", () => {
    const data = Buffer.from("hello world");
    const hash = calculateSha256(data);
    expect(hash.toString("hex")).toBe(
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    );
  });

  it("detects upgraded proof containing Bitcoin attestation tag", () => {
    const hash = calculateSha256("test");
    const pendingProof = buildOtsFileBuffer(hash, Buffer.from([0x01, 0x02]));
    expect(isOtsProofUpgraded(pendingProof)).toBe(false);

    const upgradedProof = buildOtsFileBuffer(
      hash,
      Buffer.concat([Buffer.from([0x01]), BITCOIN_ATTESTATION_TAG]),
    );
    expect(isOtsProofUpgraded(upgradedProof)).toBe(true);
  });

  it("parses valid OTS file buffer and returns error for invalid buffers", () => {
    const hash = calculateSha256("content");
    const ops = Buffer.from([0x10, 0x20]);
    const validProof = buildOtsFileBuffer(hash, ops);

    const parsedResult = parseOtsFileBuffer(validProof);
    expect(parsedResult.isOk()).toBe(true);
    const parsed = parsedResult.unwrap();
    expect(parsed.hash).toStrictEqual(hash);
    expect(parsed.ops).toStrictEqual(ops);

    const invalidShort = parseOtsFileBuffer(Buffer.from("short"));
    expect(invalidShort.isErr()).toBe(true);
  });

  it("stamps file with fallback when initial agenda fails", async () => {
    const testBuffer = Buffer.from("Post content for stamping");
    const mockCalendarOps = Buffer.from([0xf0, 0x0d]);

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("Internal Server Error", { status: 500 }),
      )
      .mockResolvedValueOnce(
        new Response(mockCalendarOps, {
          status: 200,
          headers: { "Content-Type": "application/octet-stream" },
        }),
      );
    vi.stubGlobal("fetch", mockFetch);

    const result = await stampWithFallback(testBuffer, [
      "https://agenda-1.org",
      "https://agenda-2.org",
    ]);

    expect(result.isOk()).toBe(true);
    const stampedBuffer = result.unwrap();
    expect(parseOtsFileBuffer(stampedBuffer).isOk()).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    vi.unstubAllGlobals();
  });

  it("returns OtsStampFailedError when all agendas fail", async () => {
    const testBuffer = Buffer.from("Content");
    const mockFetch = vi
      .fn()
      .mockResolvedValue(new Response("Error", { status: 503 }));
    vi.stubGlobal("fetch", mockFetch);

    const result = await stampWithFallback(testBuffer, [
      "https://agenda-1.org",
      "https://agenda-2.org",
    ]);

    expect(result.isErr()).toBe(true);

    vi.unstubAllGlobals();
  });

  it("upgrades pending proof when calendar returns Bitcoin attestation", async () => {
    const hash = calculateSha256("Post content");
    const pendingOps = Buffer.from([0x01, 0x02]);
    const pendingProof = buildOtsFileBuffer(hash, pendingOps);

    const upgradedOps = Buffer.concat([pendingOps, BITCOIN_ATTESTATION_TAG]);

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(upgradedOps, {
        status: 200,
        headers: { "Content-Type": "application/octet-stream" },
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    const result = await upgradeOtsProof(pendingProof, ["https://agenda.org"]);

    expect(result.isOk()).toBe(true);
    const upgradedResult = result.unwrap();
    expect(upgradedResult.upgraded).toBe(true);
    expect(isOtsProofUpgraded(upgradedResult.proof)).toBe(true);

    vi.unstubAllGlobals();
  });
});
