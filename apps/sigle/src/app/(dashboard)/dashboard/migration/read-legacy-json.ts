import { z } from "zod";

const errorBodySchema = z.object({ message: z.string() });

/**
 * Reads the JSON of a migration proxy response, or throws an `Error` with the
 * proxy's `message` (or `fallback`) when the request failed or the body isn't
 * JSON, so callers stop instead of using an error body as data.
 */
export const readLegacyJson = async <T>(
  res: Response,
  fallback: string,
): Promise<T> => {
  const data: unknown = await res.json().catch(() => null);

  if (!res.ok || data === null) {
    const error = errorBodySchema.safeParse(data);

    throw new Error(error.success ? error.data.message : fallback);
  }

  // SAFETY: the proxy forwards the legacy API's JSON, whose shape the caller declares.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return data as T;
};
