import { NextResponse } from "next/server";
import { z } from "zod";

/** The legacy Sigle v1 API, which still serves the Gaia stories. */
const LEGACY_GAIA_API_URL = "https://api.sigle.io/api/gaia";

// BNS names such as `alice.btc` or `alice.id.blockstack`.
const LEGACY_USERNAME_PATTERN = /^[a-z0-9_-]+(\.[a-z0-9_-]+)+$/;

// Story ids are random URL-safe ids.
const LEGACY_STORY_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

const errorBodySchema = z.object({ message: z.string() });

export const isLegacyUsername = (value: string): boolean =>
  value.length <= 100 && LEGACY_USERNAME_PATTERN.test(value);

export const isLegacyStoryId = (value: string): boolean =>
  value.length <= 100 && LEGACY_STORY_ID_PATTERN.test(value);

/** An error body the migration page reads, see `readLegacyJson`. */
export const legacyError = (message: string, status: number) =>
  NextResponse.json({ message }, { status });

/**
 * GETs `segments` (each URL-encoded) from the legacy API and answers with its
 * JSON. An error status is forwarded with the upstream message when it has
 * one. An unreachable API or a body that isn't JSON answers 502.
 */
export const proxyLegacyJson = async (
  segments: readonly string[],
): Promise<NextResponse> => {
  const url = `${LEGACY_GAIA_API_URL}/${segments.map(encodeURIComponent).join("/")}`;

  const res = await fetch(url).catch(() => undefined);

  if (res === undefined) {
    return legacyError("The legacy API is unavailable", 502);
  }

  const body: unknown = await res.json().catch(() => undefined);

  if (!res.ok) {
    const error = errorBodySchema.safeParse(body);

    const message = error.success
      ? error.data.message
      : "The legacy API answered with an error";

    const status = res.status >= 400 && res.status < 500 ? res.status : 502;

    return legacyError(message, status);
  }

  if (body === undefined) {
    return legacyError("The legacy API answered with an invalid body", 502);
  }

  return NextResponse.json(body);
};
