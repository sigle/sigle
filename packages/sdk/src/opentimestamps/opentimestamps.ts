import { Result } from "better-result";
import {
  BITCOIN_ATTESTATION_TAG,
  DEFAULT_OTS_AGENDAS,
  OTS_MAGIC_HEADER,
  OTS_OP_SHA256,
} from "./constants.js";
import {
  OtsParseError,
  OtsStampFailedError,
  OtsUpgradeFailedError,
  OtsVerifyError,
} from "./errors.js";
import {
  calculateSha256,
  normalizeDataInput,
  uint8ArrayConcat,
  uint8ArrayEquals,
  uint8ArrayIncludes,
} from "./utils.js";

export interface OtsStampOptions {
  agendas?: string[];
  timeoutMs?: number;
}

export interface OtsUpgradeOptions {
  agendas?: string[];
  timeoutMs?: number;
}

export interface OtsUpgradeResult {
  upgraded: boolean;
  proof: Uint8Array;
}

export interface OtsVerifyResult {
  hash: Uint8Array;
  upgraded: boolean;
  verified: boolean;
}

/**
 * Checks if raw OTS proof buffer contains a Bitcoin attestation (i.e. is fully upgraded).
 */
export function isOtsProofUpgraded(proof: Uint8Array): boolean {
  return uint8ArrayIncludes(proof, BITCOIN_ATTESTATION_TAG);
}

/**
 * Constructs an OTS v1 file buffer from SHA-256 hash and calendar ops payload.
 */
export function buildOtsFileBuffer(
  hash: Uint8Array,
  calendarOps: Uint8Array,
): Uint8Array {
  const opHeader = new Uint8Array([OTS_OP_SHA256]);
  return uint8ArrayConcat([OTS_MAGIC_HEADER, opHeader, hash, calendarOps]);
}

/**
 * Extracts SHA-256 hash and calendar ops payload from an OTS v1 file buffer.
 */
export function parseOtsFileBuffer(
  proof: Uint8Array,
): Result<{ hash: Uint8Array; ops: Uint8Array }, OtsParseError> {
  if (proof.length < OTS_MAGIC_HEADER.length + 1 + 32) {
    return Result.err(
      new OtsParseError({
        message: "Proof buffer too short to be valid OTS file",
      }),
    );
  }

  const magic = proof.subarray(0, OTS_MAGIC_HEADER.length);
  if (!uint8ArrayEquals(magic, OTS_MAGIC_HEADER)) {
    return Result.err(
      new OtsParseError({ message: "Invalid OTS magic header" }),
    );
  }

  const opcode = proof[OTS_MAGIC_HEADER.length];
  if (opcode !== OTS_OP_SHA256) {
    return Result.err(
      new OtsParseError({
        message: `Unsupported OTS hash opcode: 0x${opcode.toString(16)}`,
      }),
    );
  }

  const hashStart = OTS_MAGIC_HEADER.length + 1;
  const hash = proof.subarray(hashStart, hashStart + 32);
  const ops = proof.subarray(hashStart + 32);

  return Result.ok({ hash, ops });
}

async function submitDigestToAgenda(
  agendaUrl: string,
  hash: Uint8Array,
  timeoutMs: number,
): Promise<{ ops?: Uint8Array; error?: unknown }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${agendaUrl.replace(/\/$/, "")}/digest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        Accept: "application/octet-stream",
      },
      body: hash as BodyInit,
      signal: controller.signal,
    });

    if (response.ok) {
      const arrayBuf = await response.arrayBuffer();
      const ops = new Uint8Array(arrayBuf);
      if (ops.length > 0) {
        return { ops };
      }
    }

    return {
      error: new Error(`Agenda ${agendaUrl} returned HTTP ${response.status}`),
    };
  } catch (err) {
    return { error: err };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function submitTimestampToAgenda(
  agendaUrl: string,
  payload: Uint8Array,
  timeoutMs: number,
): Promise<Uint8Array | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${agendaUrl.replace(/\/$/, "")}/timestamp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        Accept: "application/octet-stream",
      },
      body: payload as BodyInit,
      signal: controller.signal,
    });

    if (response.ok) {
      const arrayBuf = await response.arrayBuffer();
      const upgradedOps = new Uint8Array(arrayBuf);
      if (upgradedOps.length > 0) {
        return upgradedOps;
      }
    }
  } catch {
    // Ignore and fallback to next agenda
  } finally {
    clearTimeout(timeoutId);
  }

  return null;
}

/**
 * Submits raw data or string hash to OpenTimestamps agenda servers with sequential fallback.
 */
export async function stampWithFallback(
  data: Uint8Array | string,
  agendasOrOptions?: string[] | OtsStampOptions,
  fetchTimeoutMs = 8000,
): Promise<Result<Uint8Array, OtsStampFailedError>> {
  let agendas = DEFAULT_OTS_AGENDAS;
  let timeoutMs = fetchTimeoutMs;

  if (Array.isArray(agendasOrOptions)) {
    agendas = agendasOrOptions;
  } else if (agendasOrOptions && typeof agendasOrOptions === "object") {
    if (agendasOrOptions.agendas) agendas = agendasOrOptions.agendas;
    if (agendasOrOptions.timeoutMs !== undefined)
      timeoutMs = agendasOrOptions.timeoutMs;
  }

  const hash = calculateSha256(data);
  let lastError: unknown = undefined;

  for (const agendaUrl of agendas) {
    const { ops, error } = await submitDigestToAgenda(
      agendaUrl,
      hash,
      timeoutMs,
    );
    if (ops) {
      return Result.ok(buildOtsFileBuffer(hash, ops));
    }
    if (error) {
      lastError = error;
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
 * Alias for stampWithFallback accepting an options object.
 */
export async function stamp(
  data: Uint8Array | string,
  options?: OtsStampOptions,
): Promise<Result<Uint8Array, OtsStampFailedError>> {
  return stampWithFallback(data, options);
}

/**
 * Attempts to upgrade a pending OTS proof buffer against calendar endpoints.
 */
export async function upgradeOtsProof(
  pendingProof: Uint8Array,
  agendasOrOptions?: string[] | OtsUpgradeOptions,
  fetchTimeoutMs = 8000,
): Promise<Result<OtsUpgradeResult, OtsUpgradeFailedError>> {
  let agendas = DEFAULT_OTS_AGENDAS;
  let timeoutMs = fetchTimeoutMs;

  if (Array.isArray(agendasOrOptions)) {
    agendas = agendasOrOptions;
  } else if (agendasOrOptions && typeof agendasOrOptions === "object") {
    if (agendasOrOptions.agendas) agendas = agendasOrOptions.agendas;
    if (agendasOrOptions.timeoutMs !== undefined)
      timeoutMs = agendasOrOptions.timeoutMs;
  }

  if (isOtsProofUpgraded(pendingProof)) {
    return Result.ok({ upgraded: true, proof: pendingProof });
  }

  const parseResult = parseOtsFileBuffer(pendingProof);
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
    const upgradedOps = await submitTimestampToAgenda(
      agendaUrl,
      ops.length > 0 ? ops : hash,
      timeoutMs,
    );

    if (upgradedOps) {
      const upgradedProof = buildOtsFileBuffer(hash, upgradedOps);
      if (isOtsProofUpgraded(upgradedProof)) {
        return Result.ok({ upgraded: true, proof: upgradedProof });
      }
    }
  }

  // If not yet upgraded on calendar, return upgraded: false with original pending proof
  return Result.ok({ upgraded: false, proof: pendingProof });
}

/**
 * Validates the structure of an OTS proof and optionally verifies it matches expected data or digest.
 */
export function verifyOtsProof(
  proof: Uint8Array,
  expectedDataOrHash?: Uint8Array | string,
): Result<OtsVerifyResult, OtsParseError | OtsVerifyError> {
  const parseResult = parseOtsFileBuffer(proof);
  if (parseResult.isErr()) {
    return parseResult;
  }

  const { hash } = parseResult.value;
  const upgraded = isOtsProofUpgraded(proof);

  if (expectedDataOrHash !== undefined) {
    const expectedBytes = normalizeDataInput(expectedDataOrHash);
    const directMatch = uint8ArrayEquals(hash, expectedBytes);
    const contentMatch = uint8ArrayEquals(hash, calculateSha256(expectedBytes));

    if (!directMatch && !contentMatch) {
      return Result.err(
        new OtsVerifyError({
          message: "Proof hash does not match expected data or digest",
        }),
      );
    }
  }

  return Result.ok({
    hash,
    upgraded,
    verified: true,
  });
}
