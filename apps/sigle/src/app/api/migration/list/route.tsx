import {
  fetchLegacyGaia,
  invalidParameter,
  isLegacyUsername,
} from "../legacy-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim().toLowerCase() ?? null;

  if (!isLegacyUsername(username)) {
    return invalidParameter("A valid username is required");
  }

  return fetchLegacyGaia(`${username}/stories`);
}
