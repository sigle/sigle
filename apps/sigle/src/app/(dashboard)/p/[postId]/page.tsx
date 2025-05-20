import type { Routes } from "@/lib/routes";
import { sigleApiFetchClient } from "@/lib/sigle";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostClientPage } from "./page-client";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<typeof Routes.post.params>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const { data: post } = await sigleApiFetchClient.GET("/api/posts/{postId}", {
    params: {
      path: {
        postId: params.postId,
      },
    },
  });
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

export default function Post(props: Props) {
  return <PostClientPage params={props.params} />;
}
