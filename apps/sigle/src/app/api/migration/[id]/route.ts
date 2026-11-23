import {
  fetchLegacyGaia,
  invalidParameter,
  isLegacyStoryId,
  isLegacyUsername,
} from "../legacy-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim().toLowerCase() ?? null;

  if (!isLegacyUsername(username)) {
    return invalidParameter("A valid username is required");
  }

  if (!isLegacyStoryId(id)) {
    return invalidParameter("A valid story id is required");
  }

  return fetchLegacyGaia(`${username}/stories/${id}`);
}
