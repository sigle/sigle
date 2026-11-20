import { Feed } from "feed";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { resolveImageUrl } from "@/lib/images";
import { sigleApiFetchClient } from "@/lib/sigle";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  const { data: user, error: userError } = await sigleApiFetchClient.GET(
    "/api/users/{address}",
    {
      params: {
        path: {
          address: username,
        },
      },
    },
  );

  if (!user) {
    return new NextResponse("User not found", {
      status: 404,
    });
  }

  if (userError) {
    return new NextResponse("Error fetching user", {
      status: 500,
    });
  }

  const { data: posts, error: postsError } = await sigleApiFetchClient.GET(
    "/api/posts",
    {
      params: {
        query: {
          author: username,
          limit: 100,
        },
      },
    },
  );

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
    feed.addItem({
      title: post.title,
      id: postLink,
      link: postLink,
      // The list does not include the full content, the excerpt is the
      // summary readers see in their feed reader.
      description: post.excerpt,
      date: new Date(post.createdAt),
      image: post.coverImage ? resolveImageUrl(post.coverImage.url) : undefined,
    });
  }

  return new NextResponse(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml",
    },
  });
}
