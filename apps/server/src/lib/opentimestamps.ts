import { Result, TaggedError } from "better-result";
import crypto from "node:crypto";

export const DEFAULT_OTS_AGENDAS = [
  "https://a.pool.opentimestamps.org",
  "https://b.pool.opentimestamps.org",
  "https://a.pool.eternitywall.com",
  "https://ots.btc.catallaxy.com",
];

// OpenTimestamps Magic File Header (v1)
// \x00OpenTimestamps\x00\x00Proof\x00\xbf\xf0\x0d\x48\x01
export const OTS_MAGIC_HEADER = Buffer.from([
  0x00, 0x4f, 0x70, 0x65, 0x6e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d,
  0x70, 0x73, 0x00, 0x00, 0x50, 0x72, 0x6f, 0x6f, 0x66, 0x00, 0xbf, 0xf0, 0x0d,
  0x48, 0x01,
]);

// SHA-256 Opcode in OTS spec
export const OTS_OP_SHA256 = 0x08;

// Bitcoin Attestation Tag prefix in OTS binary format
// Opcode 0x00 followed by 8 bytes: 0x05, 0x88, 0x96, 0x0d, 0x73, 0xd7, 0x19, 0x01
export const BITCOIN_ATTESTATION_TAG = Buffer.from([
  0x00, 0x05, 0x88, 0x96, 0x0d, 0x73, 0xd7, 0x19, 0x01,
]);

export class OtsStampFailedError extends TaggedError("OtsStampFailedError")<{
  cause?: unknown;
  message: string;
}>() {}

export class OtsUpgradeFailedError extends TaggedError(
  "OtsUpgradeFailedError",
)<{
  cause?: unknown;
  message: string;
}>() {}

export class OtsParseError extends TaggedError("OtsParseError")<{
  message: string;
}>() {}

/**
 * Calculates SHA-256 digest of input buffer.
 */
export function calculateSha256(data: Buffer | string): Buffer {
  const buf = typeof data === "string" ? Buffer.from(data, "utf-8") : data;
  return crypto.createHash("sha256").update(buf).digest();
}

/**
 * Checks if raw OTS proof buffer contains a Bitcoin attestation (i.e. is fully upgraded).
 */
export function isOtsProofUpgraded(proofBuffer: Buffer | Uint8Array): boolean {
  return Buffer.from(proofBuffer).includes(BITCOIN_ATTESTATION_TAG);
}

/**
 * Constructs an OTS v1 file buffer from SHA-256 hash and calendar ops payload.
 */
export function buildOtsFileBuffer(hash: Buffer, calendarOps: Buffer): Buffer {
  const opHeader = Buffer.from([OTS_OP_SHA256]);
  return Buffer.concat([OTS_MAGIC_HEADER, opHeader, hash, calendarOps]);
}

/**
 * Extracts SHA-256 hash and calendar ops payload from an OTS v1 file buffer.
 */
export function parseOtsFileBuffer(
  inputBuffer: Buffer | Uint8Array,
): Result<{ hash: Buffer; ops: Buffer }, OtsParseError> {
  const proofBuffer = Buffer.from(inputBuffer);
  if (proofBuffer.length < OTS_MAGIC_HEADER.length + 1 + 32) {
    return Result.err(
      new OtsParseError({
        message: "Proof buffer too short to be valid OTS file",
      }),
    );
  }

  const magic = proofBuffer.subarray(0, OTS_MAGIC_HEADER.length);
  if (!magic.equals(OTS_MAGIC_HEADER)) {
    return Result.err(
      new OtsParseError({ message: "Invalid OTS magic header" }),
    );
  }

  const opcode = proofBuffer[OTS_MAGIC_HEADER.length];
  if (opcode !== OTS_OP_SHA256) {
    return Result.err(
      new OtsParseError({
        message: `Unsupported OTS hash opcode: 0x${opcode.toString(16)}`,
      }),
    );
  }

  const hashStart = OTS_MAGIC_HEADER.length + 1;
  const hash = proofBuffer.subarray(hashStart, hashStart + 32);
  const ops = proofBuffer.subarray(hashStart + 32);

  return Result.ok({ hash, ops });
}

/**
 * Submits raw file buffer hash to OpenTimestamps agenda servers with sequential fallback.
 */
export async function stampWithFallback(
  fileBuffer: Buffer,
  agendas: string[] = DEFAULT_OTS_AGENDAS,
  fetchTimeoutMs = 8000,
): Promise<Result<Buffer, OtsStampFailedError>> {
  const hash = calculateSha256(fileBuffer);
  let lastError: unknown = undefined;

  for (const agendaUrl of agendas) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), fetchTimeoutMs);

      const response = await fetch(`${agendaUrl.replace(/\/$/, "")}/digest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          Accept: "application/octet-stream",
        },
        body: new Uint8Array(hash),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const arrayBuf = await response.arrayBuffer();
        const calendarOps = Buffer.from(arrayBuf);

        if (calendarOps.length > 0) {
          const fullProof = buildOtsFileBuffer(hash, calendarOps);
          return Result.ok(fullProof);
        }
      } else {
        lastError = new Error(
          `Agenda ${agendaUrl} returned HTTP ${response.status}`,
        );
      }
    } catch (err) {
      lastError = err;
    }
  }

  return Result.err(
    new OtsStampFailedError({
      cause: lastError,
      message: "Failed to submit stamp commitment to any OpenTimestamps agenda",
    }),
  );
}

/**
 * Attempts to upgrade a pending OTS proof buffer against calendar endpoints.
 */
export async function upgradeOtsProof(
  pendingProofBuffer: Buffer | Uint8Array,
  agendas: string[] = DEFAULT_OTS_AGENDAS,
  fetchTimeoutMs = 8000,
): Promise<
  Result<{ upgraded: boolean; proof: Buffer }, OtsUpgradeFailedError>
> {
  const buf = Buffer.from(pendingProofBuffer);
  if (isOtsProofUpgraded(buf)) {
    return Result.ok({ upgraded: true, proof: buf });
  }

  const parseResult = parseOtsFileBuffer(buf);
  if (parseResult.isErr()) {
    return Result.err(
      new OtsUpgradeFailedError({
        cause: parseResult.error,
        message: parseResult.error.message,
      }),
    );
  }

  const { hash, ops } = parseResult.value;

  for (const agendaUrl of agendas) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), fetchTimeoutMs);

      // Submit timestamp ops or digest to calendar upgrade/timestamp endpoint
      const response = await fetch(
        `${agendaUrl.replace(/\/$/, "")}/timestamp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            Accept: "application/octet-stream",
          },
          body: new Uint8Array(ops.length > 0 ? ops : hash),
          signal: controller.signal,
        },
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const arrayBuf = await response.arrayBuffer();
        const upgradedOps = Buffer.from(arrayBuf);
        const upgradedProof = buildOtsFileBuffer(hash, upgradedOps);

        if (isOtsProofUpgraded(upgradedProof)) {
          return Result.ok({ upgraded: true, proof: upgradedProof });
        }
      }
    } catch {
      // Continue trying next agenda
    }
  }

  // If not yet upgraded on calendar, return upgraded: false with original pending proof
  return Result.ok({ upgraded: false, proof: buf });
}
