"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use } from "react";
import { PostCollectCard } from "@/components/Post/CollectCard";
import { PostMarkdownContent } from "@/components/Post/MarkdownContent";
import { PostProvenanceCard } from "@/components/Post/ProvenanceCard";
import { PostUserActions } from "@/components/Post/UserActions";
import { PostUserInfoCard } from "@/components/Post/UserInfoCard";
import { NextLink } from "@/components/Shared/NextLink";
import { FadeSlideBottom } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { resolveImageUrl } from "@/lib/images";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";

interface Props {
  params: Promise<{ postId: string }>;
}

export function PostClientPage(props: Props) {
  const params = use(props.params);

  const { data: post } = sigleApiClient.useSuspenseQuery(
    "get",
    "/api/posts/{postId}",
    {
      params: {
        path: {
          postId: params.postId,
        },
      },
    },
  );

  if (!post) {
    notFound();
  }

  return (
    <FadeSlideBottom>
      {post.coverImage ? (
        <div className="mx-auto mt-6 max-w-4xl px-4">
          <Image
            src={resolveImageUrl(post.coverImage.id)}
            alt="Cover post"
            className="size-full rounded-2 object-cover"
            placeholder={post.coverImage.blurhash ? "blur" : "empty"}
            blurDataURL={post.coverImage.blurhash}
            width={post.coverImage.width}
            height={post.coverImage.height}
          />
        </div>
      ) : null}

      <div className="mx-auto my-8 max-w-2xl px-4 md:my-10">
        <Button
          variant="ghost"
          className="mb-6"
          nativeButton={false}
          render={<NextLink href={Routes.explore()} />}
        >
          <IconArrowLeft size={14} /> All articles
        </Button>

        <header className="mb-8 flex flex-col gap-4">
          {post.tags ? (
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          <h1 className="text-4xl font-medium text-pretty">{post.title}</h1>

          <PostUserActions post={post} />
        </header>

        <Separator className="mb-8" />

        {post.content ? <PostMarkdownContent content={post.content} /> : null}

        <Separator className="mt-10 mb-8" />

        <PostProvenanceCard post={post} />

        {post.collectible ? (
          <>
            <Separator className="my-8" />
            <PostCollectCard post={post} />
          </>
        ) : null}

        <PostUserInfoCard post={post} />
      </div>
    </FadeSlideBottom>
  );
}
