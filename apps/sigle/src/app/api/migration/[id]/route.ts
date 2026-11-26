import {
  isLegacyStoryId,
  isLegacyUsername,
  legacyError,
  proxyLegacyJson,
} from "../legacy-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const username = new URL(request.url).searchParams.get("username");

  if (!username || !isLegacyUsername(username)) {
    return legacyError("A valid username is required", 400);
  }

  if (!isLegacyStoryId(id)) {
    return legacyError("Invalid story id", 400);
  }

  return proxyLegacyJson([username, "stories", id]);
}
