import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Routes } from "@/lib/routes";
import { sigleApiFetchClient } from "@/lib/sigle";
import { PostClientPage } from "./page-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<typeof Routes.post.params>;
}

// Shared by `generateMetadata` and the page, so a request asks the API once.
// A missing post renders the 404 page; any other API error still throws.
const getPost = cache(async (postId: string) => {
  const { data, error, response } = await sigleApiFetchClient.GET(
    "/api/posts/{postId}",
    { params: { path: { postId } } },
  );

  if (response.status === 404) {
    notFound();
  }

  if (error) {
    throw new Error(`Failed to load post ${postId}: ${response.status}`);
  }

  return data;
});

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const post = await getPost(params.postId);

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;

  return {
    title: `${title} | Sigle`,
    description,
    alternates: {
      canonical: post.canonicalUri,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function Post(props: Props) {
  const params = await props.params;
  const post = await getPost(params.postId);

  return <PostClientPage post={post} />;
}
