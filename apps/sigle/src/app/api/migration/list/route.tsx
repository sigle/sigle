import { isLegacyUsername, legacyError, proxyLegacyJson } from "../legacy-api";

export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username");

  if (!username || !isLegacyUsername(username)) {
    return legacyError("A valid username is required", 400);
  }

  return proxyLegacyJson([username, "stories"]);
}
