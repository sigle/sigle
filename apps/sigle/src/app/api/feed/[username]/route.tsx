import { Feed } from "feed";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { CONTENT_WARNINGS } from "@/lib/content-warning";
import { resolveImageUrl } from "@/lib/images";
import { sigleApiFetchClient } from "@/lib/sigle";

/**
 * `feed` writes item titles and descriptions as CDATA sections, and its XML
 * writer (xml-js) escapes only the first `]]>` of each. Any further `]]>`
 * would end the section early and turn the rest of the text into markup, so
 * every one becomes text that cannot end a section.
 */
const escapeCdataEnd = (text: string): string =>
  text.replaceAll("]]>", "]]&gt;");

export async function GET(
  _: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  const [
    { data: user, error: userError, response: userResponse },
    { data: posts, error: postsError },
  ] = await Promise.all([
    sigleApiFetchClient.GET("/api/users/{address}", {
      params: { path: { address: username } },
    }),
    sigleApiFetchClient.GET("/api/posts", {
      params: { query: { author: username, limit: 100 } },
    }),
  ]);

  // The API answers 400 for an invalid address and 404 for an unknown one,
  // anything else is a failure to report as one, not as a missing feed.
  if (userResponse.status === 400 || userResponse.status === 404) {
    return new NextResponse("User not found", { status: 404 });
  }

  if (userError || !user) {
    return new NextResponse("Error fetching user", { status: 500 });
  }

  if (postsError) {
    return new NextResponse("Error fetching posts", {
      status: 500,
    });
  }

  const userLink = `${env.NEXT_PUBLIC_APP_URL}/u/${username}`;

  const feed = new Feed({
    title: user.profile?.displayName || user.address,
    description: user.profile?.description ?? undefined,
    id: userLink,
    link: userLink,
    language: "en",
    copyright: `All rights reserved ${new Date().getFullYear()}, ${username}`,
    author: {
      name: username,
      link: userLink,
    },
  });

  for (const post of posts.results) {
    const postLink = `${env.NEXT_PUBLIC_APP_URL}/p/${post.id}`;

    const warning = post.contentWarning
      ? CONTENT_WARNINGS[post.contentWarning]
      : null;

    feed.addItem({
      title: escapeCdataEnd(post.title),
      id: postLink,
      link: postLink,
      // The list does not include the full content, the excerpt is the
      // summary readers see in their feed reader. Feed readers cannot hide a
      // post behind a warning, so the warning replaces the excerpt and cover.
      description: warning
        ? `Content warning: ${warning.label}`
        : escapeCdataEnd(post.excerpt),
      category: warning ? [{ name: warning.label }] : undefined,
      date: new Date(post.createdAt),
      image:
        post.coverImage && !warning
          ? resolveImageUrl(post.coverImage.url)
          : undefined,
    });
  }

  return new NextResponse(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml",
      // Feed readers poll often without a session; five minutes matches the scale of the API's own one-minute public cache.
      "Cache-Control": "public, max-age=300",
    },
  });
}
