import type { Metadata } from "next";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Routes } from "@/lib/routes";
import { CONTENT_WARNINGS } from "@/lib/content-warning";
import { sigleApiClient, sigleApiFetchClient } from "@/lib/sigle";
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

  // Link previews do not show what a post behind a content warning says.
  const description = post.contentWarning
    ? `Content warning: ${CONTENT_WARNINGS[post.contentWarning].label}`
    : post.metaDescription || post.excerpt;

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
  const { postId } = await props.params;
  const { data, response } = await getPost(postId);

  if (response.status === 404) {
    notFound();
  }

  // Hand the result to the client query, so the browser doesn't fetch it again.
  const queryClient = new QueryClient();
  queryClient.setQueryData(
    sigleApiClient.queryOptions("get", "/api/posts/{postId}", {
      params: { path: { postId } },
    }).queryKey,
    data,
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostClientPage params={props.params} />
    </HydrationBoundary>
  );
}
