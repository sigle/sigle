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

// Shared by the metadata and the page, so the API is called once per request.
const getPost = cache((postId: string) =>
  sigleApiFetchClient.GET("/api/posts/{postId}", {
    params: { path: { postId } },
  }),
);

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const { data: post } = await getPost(params.postId);

  if (!post) {
    notFound();
  }

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
  // The client query throws on a missing post, so check it here to show the 404 page.
  const { response } = await getPost((await props.params).postId);

  if (response.status === 404) {
    notFound();
  }

  return <PostClientPage params={props.params} />;
}
