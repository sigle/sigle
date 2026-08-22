import { describe, expect, it, vi } from "vite-plus/test";
import {
  BITCOIN_ATTESTATION_TAG,
  buildOtsFileBuffer,
  calculateSha256,
  calculateSha256Hex,
  isOtsProofUpgraded,
  type OtsParseError,
  type OtsStampFailedError,
  type OtsUpgradeFailedError,
  type OtsUpgradeResult,
  type OtsVerifyError,
  type OtsVerifyResult,
  parseOtsFileBuffer,
  stamp,
  stampWithFallback,
  uint8ArrayConcat,
  uint8ArrayEquals,
  uint8ArrayIncludes,
  upgradeOtsProof,
  verifyOtsProof,
} from "./index.js";

describe("openTimestamps SDK module", () => {
  describe("utils", () => {
    it("calculates SHA-256 digest and hex correctly", () => {
      const data = new TextEncoder().encode("hello world");
      const hash = calculateSha256(data);
      const hex = calculateSha256Hex("hello world");

      expect(hex).toBe(
        "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
      );
      expect(calculateSha256Hex(hash)).toBe(
        calculateSha256Hex(calculateSha256("hello world")),
      );
    });

    it("uint8ArrayEquals works as expected", () => {
      const a = new Uint8Array([1, 2, 3]);
      const b = new Uint8Array([1, 2, 3]);
      const c = new Uint8Array([1, 2, 4]);

      expect(uint8ArrayEquals(a, b)).toBe(true);
      expect(uint8ArrayEquals(a, c)).toBe(false);
      expect(uint8ArrayEquals(a, new Uint8Array([1, 2]))).toBe(false);
    });

    it("uint8ArrayConcat concatenates multiple buffers", () => {
      const a = new Uint8Array([1, 2]);
      const b = new Uint8Array([3, 4]);
      const c = new Uint8Array([5]);
      const result = uint8ArrayConcat([a, b, c]);

      expect(result).toStrictEqual(new Uint8Array([1, 2, 3, 4, 5]));
    });

    it("uint8ArrayIncludes finds matching subsequences", () => {
      const source = new Uint8Array([10, 20, 30, 40, 50]);
      expect(uint8ArrayIncludes(source, new Uint8Array([20, 30]))).toBe(true);
      expect(uint8ArrayIncludes(source, new Uint8Array([40, 50]))).toBe(true);
      expect(uint8ArrayIncludes(source, new Uint8Array([]))).toBe(true);
    });

    it("uint8ArrayIncludes rejects non-matching subsequences", () => {
      const source = new Uint8Array([10, 20, 30, 40, 50]);
      expect(uint8ArrayIncludes(source, new Uint8Array([20, 40]))).toBe(false);
      expect(
        uint8ArrayIncludes(source, new Uint8Array([10, 20, 30, 40, 50, 60])),
      ).toBe(false);
    });
  });

  describe("proof formatting", () => {
    it("detects upgraded proof containing Bitcoin attestation tag", () => {
      const hash = calculateSha256("test");
      const pendingProof = buildOtsFileBuffer(
        hash,
        new Uint8Array([0x01, 0x02]),
      );
      expect(isOtsProofUpgraded(pendingProof)).toBe(false);

      const upgradedProof = buildOtsFileBuffer(
        hash,
        uint8ArrayConcat([new Uint8Array([0x01]), BITCOIN_ATTESTATION_TAG]),
      );
      expect(isOtsProofUpgraded(upgradedProof)).toBe(true);
    });

    it("parses valid OTS file buffer", () => {
      const hash = calculateSha256("content");
      const ops = new Uint8Array([0x10, 0x20]);
      const validProof = buildOtsFileBuffer(hash, ops);

      const parsedResult = parseOtsFileBuffer(validProof);
      expect(parsedResult.isOk()).toBe(true);
      const value = (
        parsedResult as unknown as {
          value: { hash: Uint8Array; ops: Uint8Array };
        }
      ).value;
      expect(value.hash).toStrictEqual(hash);
      expect(value.ops).toStrictEqual(ops);
    });

    it("returns error for short OTS buffer", () => {
      const parsed = parseOtsFileBuffer(new Uint8Array([1, 2, 3]));
      expect(parsed.isErr()).toBe(true);
      const err = (parsed as unknown as { error: OtsParseError }).error;
      expect(err._tag).toBe("OtsParseError");
    });

    it("returns error for invalid magic header or opcode", () => {
      const hash = calculateSha256("content");
      const validProof = buildOtsFileBuffer(hash, new Uint8Array([0x01]));

      const invalidMagic = new Uint8Array(validProof);
      invalidMagic[0] = 0xff;
      expect(parseOtsFileBuffer(invalidMagic).isErr()).toBe(true);

      const invalidOpcode = new Uint8Array(validProof);
      invalidOpcode[28] = 0x99;
      expect(parseOtsFileBuffer(invalidOpcode).isErr()).toBe(true);
    });
  });

  describe(stampWithFallback, () => {
    it("stamps file with fallback when initial agenda fails", async () => {
      const testBuffer = new TextEncoder().encode("Post content for stamping");
      const mockCalendarOps = new Uint8Array([0xf0, 0x0d]);

      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(
          new Response("Internal Server Error", { status: 500 }),
        )
        .mockResolvedValueOnce(
          new Response(mockCalendarOps as BodyInit, {
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
      const value = (result as unknown as { value: Uint8Array }).value;
      expect(parseOtsFileBuffer(value).isOk()).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);

      vi.unstubAllGlobals();
    });

    it("supports stamp() with options object", async () => {
      const testBuffer = "Post content string";
      const mockCalendarOps = new Uint8Array([0xaa, 0xbb]);

      const mockFetch = vi.fn().mockResolvedValueOnce(
        new Response(mockCalendarOps as BodyInit, {
          status: 200,
          headers: { "Content-Type": "application/octet-stream" },
        }),
      );
      vi.stubGlobal("fetch", mockFetch);

      const result = await stamp(testBuffer, {
        agendas: ["https://agenda-direct.org"],
        timeoutMs: 5000,
      });

      expect(result.isOk()).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://agenda-direct.org/digest",
        expect.objectContaining({
          method: "POST",
        }),
      );

      vi.unstubAllGlobals();
    });

    it("returns OtsStampFailedError when all agendas fail", async () => {
      const testBuffer = new TextEncoder().encode("Content");
      const mockFetch = vi
        .fn()
        .mockResolvedValue(new Response("Error", { status: 503 }));
      vi.stubGlobal("fetch", mockFetch);

      const result = await stampWithFallback(testBuffer, [
        "https://agenda-1.org",
        "https://agenda-2.org",
      ]);

      expect(result.isErr()).toBe(true);
      const err = (result as unknown as { error: OtsStampFailedError }).error;
      expect(err._tag).toBe("OtsStampFailedError");

      vi.unstubAllGlobals();
    });
  });

  describe(upgradeOtsProof, () => {
    it("returns immediately if proof is already upgraded", async () => {
      const hash = calculateSha256("Post content");
      const upgradedOps = uint8ArrayConcat([
        new Uint8Array([0x01]),
        BITCOIN_ATTESTATION_TAG,
      ]);
      const upgradedProof = buildOtsFileBuffer(hash, upgradedOps);

      const mockFetch = vi.fn();
      vi.stubGlobal("fetch", mockFetch);

      const result = await upgradeOtsProof(upgradedProof);
      expect(result.isOk()).toBe(true);
      const value = (result as unknown as { value: OtsUpgradeResult }).value;
      expect(value.upgraded).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });

    it("upgrades pending proof when calendar returns Bitcoin attestation", async () => {
      const hash = calculateSha256("Post content");
      const pendingOps = new Uint8Array([0x01, 0x02]);
      const pendingProof = buildOtsFileBuffer(hash, pendingOps);

      const upgradedOps = uint8ArrayConcat([
        pendingOps,
        BITCOIN_ATTESTATION_TAG,
      ]);

      const mockFetch = vi.fn().mockResolvedValue(
        new Response(upgradedOps as BodyInit, {
          status: 200,
          headers: { "Content-Type": "application/octet-stream" },
        }),
      );
      vi.stubGlobal("fetch", mockFetch);

      const result = await upgradeOtsProof(pendingProof, {
        agendas: ["https://agenda.org"],
      });

      expect(result.isOk()).toBe(true);
      const upgradedResult = (result as unknown as { value: OtsUpgradeResult })
        .value;
      expect(upgradedResult.upgraded).toBe(true);
      expect(isOtsProofUpgraded(upgradedResult.proof)).toBe(true);

      vi.unstubAllGlobals();
    });

    it("returns upgraded: false when proof is still pending on calendar", async () => {
      const hash = calculateSha256("Pending content");
      const pendingOps = new Uint8Array([0x01, 0x02]);
      const pendingProof = buildOtsFileBuffer(hash, pendingOps);

      const mockFetch = vi.fn().mockResolvedValue(
        new Response(pendingOps as BodyInit, {
          status: 200,
          headers: { "Content-Type": "application/octet-stream" },
        }),
      );
      vi.stubGlobal("fetch", mockFetch);

      const result = await upgradeOtsProof(pendingProof, [
        "https://agenda.org",
      ]);

      expect(result.isOk()).toBe(true);
      const res = (result as unknown as { value: OtsUpgradeResult }).value;
      expect(res.upgraded).toBe(false);
      expect(res.proof).toStrictEqual(pendingProof);

      vi.unstubAllGlobals();
    });

    it("returns OtsUpgradeFailedError on malformed pending proof", async () => {
      const result = await upgradeOtsProof(new Uint8Array([1, 2, 3]));
      expect(result.isErr()).toBe(true);
      const err = (result as unknown as { error: OtsUpgradeFailedError }).error;
      expect(err._tag).toBe("OtsUpgradeFailedError");
    });
  });

  describe(verifyOtsProof, () => {
    it("verifies proof against raw content and SHA-256 hash", () => {
      const content = "Verifiable article content";
      const hash = calculateSha256(content);
      const pendingOps = new Uint8Array([0x01]);
      const proof = buildOtsFileBuffer(hash, pendingOps);

      const verifyContent = verifyOtsProof(proof, content);
      expect(verifyContent.isOk()).toBe(true);
      const value = (verifyContent as unknown as { value: OtsVerifyResult })
        .value;
      expect(value.verified).toBe(true);
      expect(value.upgraded).toBe(false);

      const verifyHash = verifyOtsProof(proof, hash);
      expect(verifyHash.isOk()).toBe(true);
    });

    it("returns OtsVerifyError on content mismatch", () => {
      const content = "Verifiable article content";
      const hash = calculateSha256(content);
      const pendingOps = new Uint8Array([0x01]);
      const proof = buildOtsFileBuffer(hash, pendingOps);

      const verifyMismatch = verifyOtsProof(proof, "different content");
      expect(verifyMismatch.isErr()).toBe(true);
      const err = (verifyMismatch as unknown as { error: OtsVerifyError })
        .error;
      expect(err._tag).toBe("OtsVerifyError");
    });
  });
});
