import { NextResponse } from "next/server";

// A BNS name such as `name.btc` or `name.id.stx`
const USERNAME = /^[a-z0-9_-]+(?:\.[a-z0-9_-]+){1,2}$/;

// The legacy app's story ids are nanoids
const STORY_ID = /^[\w-]{1,64}$/;

/**
 * The parameters end up in the path of the legacy API request, so they are
 * only accepted when they can't change it, such as with `../`.
 */
export const isLegacyUsername = (username: string | null): username is string =>
  username !== null && username.length <= 64 && USERNAME.test(username);

export const isLegacyStoryId = (id: string): boolean => STORY_ID.test(id);

export const invalidParameter = (message: string) =>
  NextResponse.json({ message }, { status: 400 });

/**
 * Proxies a GET to the legacy API's Gaia routes, keeping its status so the
 * migration page sees errors as errors.
 */
export const fetchLegacyGaia = async (path: string) => {
  const res = await fetch(`https://api.sigle.io/api/gaia/${path}`);

  return NextResponse.json(await res.json(), { status: res.status });
};
