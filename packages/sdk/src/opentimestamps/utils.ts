import { bytesToHex } from "@stacks/common";
import { hashSha256Sync } from "@stacks/encryption";

/**
 * Normalizes input data (string or Uint8Array) to a Uint8Array.
 */
export function normalizeDataInput(data: Uint8Array | string): Uint8Array {
  if (typeof data === "string") {
    return new TextEncoder().encode(data);
  }
  return data;
}

/**
 * Calculates SHA-256 digest of input data (Uint8Array or UTF-8 string).
 */
export function calculateSha256(data: Uint8Array | string): Uint8Array {
  const bytes = normalizeDataInput(data);
  return hashSha256Sync(bytes);
}

/**
 * Calculates SHA-256 digest of input data and returns it as a lowercase hex string.
 */
export function calculateSha256Hex(data: Uint8Array | string): string {
  return bytesToHex(calculateSha256(data));
}

/**
 * Validates and sanitizes a calendar agenda URL, ensuring http/https protocol and stripping trailing slashes.
 */
export function sanitizeAgendaUrl(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (!trimmed) return null;
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return trimmed.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

/**
 * Validates and sanitizes a list of calendar agenda URLs, deduplicating valid entries.
 */
export function sanitizeAgendaUrls(urls: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < urls.length; i += 1) {
    const sanitized = sanitizeAgendaUrl(urls[i]);
    if (sanitized && !result.includes(sanitized)) {
      result.push(sanitized);
    }
  }
  return result;
}

/**
 * Checks whether two Uint8Array buffers are byte-for-byte equal.
 */
export function uint8ArrayEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Concatenates multiple Uint8Array buffers into a single new Uint8Array.
 */
export function uint8ArrayConcat(arrays: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const arr of arrays) {
    totalLength += arr.length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Checks if target Uint8Array subsequence is contained within source Uint8Array.
 */
export function uint8ArrayIncludes(
  source: Uint8Array,
  target: Uint8Array,
): boolean {
  if (target.length === 0) return true;
  if (source.length < target.length) return false;
  const max = source.length - target.length;
  for (let i = 0; i <= max; i++) {
    if (source[i] === target[0]) {
      let match = true;
      for (let j = 1; j < target.length; j++) {
        if (source[i + j] !== target[j]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
  }
  return false;
}
