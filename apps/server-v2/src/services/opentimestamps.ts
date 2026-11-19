import {
  OpenTimestampsClient as OtsClient,
  StampError,
  UpgradeError,
  ValidationError,
  type VerificationResult,
  type VerificationSuccess,
} from "@otskit/client";
import { Context, Data, Effect, Layer } from "effect";

export class OtsStampError extends Data.TaggedError("OtsStampError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export class OtsNotAnchoredError extends Data.TaggedError(
  "OtsNotAnchoredError",
)<{
  readonly message: string;
}> {}

export class OtsInvalidProofError extends Data.TaggedError(
  "OtsInvalidProofError",
)<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export class OtsUpgradeError extends Data.TaggedError("OtsUpgradeError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export type OtsUpgradeFailure =
  | OtsNotAnchoredError
  | OtsInvalidProofError
  | OtsUpgradeError;

export interface OpenTimestampsOperations {
  /**
   * Submits a SHA-256 hash (64 hex chars) to the calendars and returns the
   * serialized pending `.ots` proof.
   */
  readonly stamp: (contentHash: string) => Effect.Effect<Buffer, OtsStampError>;
  /**
   * Queries the calendars embedded in the pending proof for a Bitcoin
   * attestation. `OtsNotAnchoredError` means the timestamp is still pending
   * and the call should be retried later.
   */
  readonly upgrade: (
    pendingProof: Uint8Array,
  ) => Effect.Effect<Buffer, OtsUpgradeFailure>;
  /**
   * Best-effort verification against the Bitcoin chain. Failures (including
   * an unreachable Esplora endpoint) are returned as a `network_error`
   * status instead of failing the caller.
   */
  readonly verify: (
    proof: Uint8Array,
    contentHash: string,
  ) => Effect.Effect<VerificationResult>;
}

interface OtsClientLike {
  readonly stamp: (hash: Buffer | string) => Promise<Buffer>;
  readonly upgrade: (proof: Buffer) => Promise<Buffer>;
  readonly verify: (
    proof: Buffer,
    originalDataHash?: Buffer | string,
  ) => Promise<VerificationResult>;
}

export const makeOpenTimestampsService = (
  client: OtsClientLike,
): OpenTimestampsOperations => ({
  stamp: (contentHash) =>
    Effect.tryPromise({
      try: () => client.stamp(contentHash),
      catch: (cause) =>
        new OtsStampError({
          message:
            cause instanceof StampError
              ? cause.message
              : "OpenTimestamps stamp operation failed",
          cause,
        }),
    }),
  upgrade: (pendingProof) =>
    Effect.tryPromise({
      try: () => client.upgrade(Buffer.from(pendingProof)),
      catch: (cause) => {
        if (cause instanceof UpgradeError) {
          return new OtsNotAnchoredError({
            message: "OpenTimestamps proof is not anchored in Bitcoin yet",
          });
        }

        if (cause instanceof ValidationError) {
          return new OtsInvalidProofError({
            message: `Stored OpenTimestamps pending proof is invalid: ${cause.message}`,
            cause,
          });
        }

        return new OtsUpgradeError({
          message:
            cause instanceof Error
              ? cause.message
              : "OpenTimestamps upgrade operation failed",
          cause,
        });
      },
    }),
  verify: (proof, contentHash) =>
    Effect.promise(async () => {
      try {
        return await client.verify(Buffer.from(proof), contentHash);
      } catch (cause) {
        return {
          status: "network_error" as const,
          reason: cause instanceof Error ? cause.message : String(cause),
        };
      }
    }),
});

export const OTS_TEST_PENDING_PROOF = Buffer.from("ots-test-pending-proof");

export const OTS_TEST_UPGRADED_PROOF = Buffer.from("ots-test-upgraded-proof");

export const OTS_TEST_VERIFICATION: VerificationSuccess = {
  status: "verified",
  blockHeight: 800_000,
  blockTime: 1_700_000_000,
};

export class OpenTimestampsService extends Context.Service<
  OpenTimestampsService,
  OpenTimestampsOperations
>()("sigle/OpenTimestampsService") {
  static readonly layer: Layer.Layer<OpenTimestampsService> = Layer.sync(
    OpenTimestampsService,
    () => makeOpenTimestampsService(new OtsClient()),
  );

  static readonly layerTest = (
    overrides: Partial<OpenTimestampsOperations> = {},
  ): Layer.Layer<OpenTimestampsService> =>
    Layer.succeed(OpenTimestampsService, {
      stamp: () => Effect.succeed(OTS_TEST_PENDING_PROOF),
      upgrade: () => Effect.succeed(OTS_TEST_UPGRADED_PROOF),
      verify: () => Effect.succeed(OTS_TEST_VERIFICATION),
      ...overrides,
    });
}
