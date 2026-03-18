"use client";

import { Button, Container } from "@radix-ui/themes";
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
        <Container size="3" className="mt-6 px-4">
          <Image
            src={resolveImageUrl(post.coverImage.id)}
            alt="Cover post"
            className="size-full rounded-2 object-cover"
            placeholder={post.coverImage.blurhash ? "blur" : "empty"}
            blurDataURL={post.coverImage.blurhash}
            width={post.coverImage.width}
            height={post.coverImage.height}
          />
        </Container>
      ) : null}

      <Container size="2" className="my-8 px-4 md:my-10">
        <Button color="gray" variant="ghost" className="mb-6" asChild>
          <NextLink href={Routes.explore()}>
            <IconArrowLeft size={14} /> All articles
          </NextLink>
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

          <h1 className="text-xs font-medium text-pretty">{post.title}</h1>

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
      </Container>
    </FadeSlideBottom>
  );
}
