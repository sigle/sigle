"use client";

import { Badge, Button, Container, Heading, Separator } from "@radix-ui/themes";
import { IconArrowLeft } from "@tabler/icons-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use } from "react";
import { PostCollectCard } from "@/components/Post/CollectCard";
import { PostInfoCard } from "@/components/Post/InfoCard";
import { PostMarkdownContent } from "@/components/Post/MarkdownContent";
import { PostProvenanceCard } from "@/components/Post/ProvenanceCard";
import { PostShareCard } from "@/components/Post/ShareCard";
import { PostUserActions } from "@/components/Post/UserActions";
import { PostUserInfoCard } from "@/components/Post/UserInfoCard";
import { NextLink } from "@/components/Shared/NextLink";
import { FadeSlideBottom } from "@/components/ui";
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
        <Container size="2" className="mt-6 px-4">
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

      <Container
        size="2"
        className="
          my-8 px-4
          md:my-10
        "
      >
        <Button color="gray" variant="ghost" className="mb-6" asChild>
          <NextLink href={Routes.explore()}>
            <IconArrowLeft size={14} /> All articles
          </NextLink>
        </Button>

        <header className="mb-8 flex flex-col gap-4">
          {post.tags ? (
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} color="gray" highContrast>
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          <Heading as="h1" size="8" className="text-pretty">
            {post.title}
          </Heading>

          <PostUserActions post={post} />
        </header>

        <Separator size="4" className="mb-8" />

        {post.content ? <PostMarkdownContent content={post.content} /> : null}

        <Separator size="4" className="mt-10 mb-8" />

        <PostProvenanceCard post={post} />

        <Separator size="4" className="my-8" />

        <PostCollectCard post={post} />

        <Separator size="4" className="my-8" />

        <div
          className={`
            mt-10 grid grid-cols-1 gap-10
            md:grid-cols-3 md:items-center
          `}
        >
          <PostInfoCard post={post} />
          <PostShareCard post={post} />
        </div>

        <PostUserInfoCard post={post} />
      </Container>
    </FadeSlideBottom>
  );
}
