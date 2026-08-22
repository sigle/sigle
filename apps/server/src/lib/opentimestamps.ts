import {
  hashBuffer,
  OpenTimestampsClient,
  StampError,
  UpgradeError,
  ValidationError,
} from "@otskit/client";
import { Result, TaggedError } from "better-result";
import { consola } from "@/lib/consola";

export class OtsStampFailedError extends TaggedError("OtsStampFailedError")<{
  successfulCalendars: string[];
  failedCalendars: string[];
  message: string;
  cause: unknown;
}> {}

export class OtsProofNotAnchoredError extends TaggedError(
  "OtsProofNotAnchoredError",
)<{
  message: string;
}> {}

export class OtsInvalidProofError extends TaggedError("OtsInvalidProofError")<{
  message: string;
  cause?: unknown;
}> {}

export class OtsUpgradeFailedError extends TaggedError(
  "OtsUpgradeFailedError",
)<{
  message: string;
  cause: unknown;
}> {}

export type OtsUpgradeError =
  | OtsProofNotAnchoredError
  | OtsInvalidProofError
  | OtsUpgradeFailedError;

const openTimestampsClient = new OpenTimestampsClient({
  logger: consola,
});

export async function stampContent(
  data: Buffer | Uint8Array,
): Promise<Result<Buffer, OtsStampFailedError>> {
  const hash = hashBuffer(data);
  return Result.tryPromise({
    try: async () => openTimestampsClient.stamp(hash),
    catch: (cause) => {
      if (cause instanceof StampError) {
        return new OtsStampFailedError({
          successfulCalendars: cause.successfulSubmissions.map(
            (submission) => submission.calendar,
          ),
          failedCalendars: cause.failedSubmissions.map(
            (submission) => submission.calendar,
          ),
          message: `OpenTimestamps stamp did not reach enough calendars: ${cause.message}`,
          cause,
        });
      }
      return new OtsStampFailedError({
        successfulCalendars: [],
        failedCalendars: [],
        message: "OpenTimestamps stamp operation failed",
        cause,
      });
    },
  });
}

export async function upgradeOtsProof(
  pendingProof: Uint8Array,
): Promise<Result<Buffer, OtsUpgradeError>> {
  return Result.tryPromise({
    try: async () => openTimestampsClient.upgrade(Buffer.from(pendingProof)),
    catch: (cause) => {
      if (cause instanceof UpgradeError) {
        return new OtsProofNotAnchoredError({
          message: "OTS proof is still pending, no Bitcoin attestation yet",
        });
      }
      if (cause instanceof ValidationError) {
        return new OtsInvalidProofError({
          message: `OTS pending proof format is invalid: ${cause.message}`,
          cause,
        });
      }
      return new OtsUpgradeFailedError({
        message: "Failed to query OpenTimestamps calendars for upgrade",
        cause,
      });
    },
  });
}
