import { createHash } from "node:crypto";

/**
 * Content version used to make uploads idempotent and to bust caches.
 */
export const sha256Hex = (data: Uint8Array): string =>
  createHash("sha256").update(data).digest("hex");
