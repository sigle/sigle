import { describe, expect, it } from "@effect/vitest";
import {
  StampError,
  UpgradeError,
  ValidationError,
  type VerificationResult,
} from "@otskit/client";
import { Effect } from "effect";
import {
  makeOpenTimestampsService,
  OtsInvalidProofError,
  OtsNotAnchoredError,
  OtsStampError,
  OtsUpgradeError,
} from "@/services/opentimestamps";

interface FakeClient {
  readonly stamp: (hash: Buffer | string) => Promise<Buffer>;
  readonly upgrade: (proof: Buffer) => Promise<Buffer>;
  readonly verify: (
    proof: Buffer,
    originalDataHash?: Buffer | string,
  ) => Promise<VerificationResult>;
}

const makeFakeClient = (overrides: Partial<FakeClient>): FakeClient => ({
  stamp: async () => Buffer.from("pending"),
  upgrade: async () => Buffer.from("upgraded"),
  verify: async () => ({
    status: "pending",
    reason: "not confirmed yet",
  }),
  ...overrides,
});

describe("opentimestamps service", () => {
  it.effect("stamps a hash and returns the pending proof", () =>
    Effect.gen(function* () {
      const hashes: Array<Buffer | string> = [];
      const pendingProof = Buffer.from("pending-proof");

      const service = makeOpenTimestampsService(
        makeFakeClient({
          stamp: async (hash) => {
            hashes.push(hash);

            return pendingProof;
          },
        }),
      );

      const proof = yield* service.stamp("a".repeat(64));

      expect({ hashes, proof }).toStrictEqual({
        hashes: ["a".repeat(64)],
        proof: pendingProof,
      });
    }),
  );

  it.effect("wraps StampError in OtsStampError", () =>
    Effect.gen(function* () {
      const service = makeOpenTimestampsService(
        makeFakeClient({
          stamp: async () => {
            throw new StampError(
              "Insufficient successful submissions (0/2 required)",
              [],
              [],
            );
          },
        }),
      );

      const error = yield* service.stamp("a".repeat(64)).pipe(Effect.flip);

      expect(error).toBeInstanceOf(OtsStampError);
      expect(error._tag).toBe("OtsStampError");
      expect(error.message).toBe(
        "Insufficient successful submissions (0/2 required)",
      );
    }),
  );

  it.effect("maps UpgradeError to OtsNotAnchoredError", () =>
    Effect.gen(function* () {
      const service = makeOpenTimestampsService(
        makeFakeClient({
          upgrade: async () => {
            throw new UpgradeError("No calendar has confirmed the timestamp");
          },
        }),
      );

      const error = yield* service
        .upgrade(Buffer.from("pending"))
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(OtsNotAnchoredError);
      expect(error._tag).toBe("OtsNotAnchoredError");
    }),
  );

  it.effect("maps ValidationError to OtsInvalidProofError", () =>
    Effect.gen(function* () {
      const service = makeOpenTimestampsService(
        makeFakeClient({
          upgrade: async () => {
            throw new ValidationError("Invalid .ots proof format");
          },
        }),
      );

      const error = yield* service
        .upgrade(Buffer.from("pending"))
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(OtsInvalidProofError);
      expect(error._tag).toBe("OtsInvalidProofError");
      expect(error.message).toBe(
        "Stored OpenTimestamps pending proof is invalid: Invalid .ots proof format",
      );
    }),
  );

  it.effect("maps unexpected upgrade failures to OtsUpgradeError", () =>
    Effect.gen(function* () {
      const service = makeOpenTimestampsService(
        makeFakeClient({
          upgrade: async () => {
            throw new Error("socket hang up");
          },
        }),
      );

      const error = yield* service
        .upgrade(Buffer.from("pending"))
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(OtsUpgradeError);
      expect(error._tag).toBe("OtsUpgradeError");
      expect(error.message).toBe("socket hang up");
    }),
  );

  it.effect("returns the verification result", () =>
    Effect.gen(function* () {
      const verification: VerificationResult = {
        status: "verified",
        blockHeight: 812_345,
        blockTime: 1_700_000_000,
      };

      const service = makeOpenTimestampsService(
        makeFakeClient({ verify: async () => verification }),
      );

      const result = yield* service.verify(
        Buffer.from("proof"),
        "a".repeat(64),
      );

      expect(result).toStrictEqual(verification);
    }),
  );

  it.effect("returns a network_error status when verification throws", () =>
    Effect.gen(function* () {
      const service = makeOpenTimestampsService(
        makeFakeClient({
          verify: async () => {
            throw new Error("esplora unreachable");
          },
        }),
      );

      const result = yield* service.verify(
        Buffer.from("proof"),
        "a".repeat(64),
      );

      expect(result).toStrictEqual({
        status: "network_error",
        reason: "esplora unreachable",
      });
    }),
  );
});
