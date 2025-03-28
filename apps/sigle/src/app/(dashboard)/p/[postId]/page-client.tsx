"use client";

import { sigleApiClient } from "@/__generated__/sigle-api";
import { PostCollectCard } from "@/components/Post/CollectCard";
import { PostInfoCard } from "@/components/Post/InfoCard";
import { PostMarkdownContent } from "@/components/Post/MarkdownContent";
import { PostShareCard } from "@/components/Post/ShareCard";
import { PostUserActions } from "@/components/Post/UserActions";
import { PostUserInfoCard } from "@/components/Post/UserInfoCard";
import { FadeSlideBottom } from "@/components/ui";
import { resolveImageUrl } from "@/lib/images";
import { Badge, Container, Heading, Separator } from "@radix-ui/themes";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use } from "react";

type Props = {
  params: Promise<{ postId: string }>;
};

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
      <Container size="2" className="my-20 px-4">
        <Heading size="8" className="text-pretty">
          {post.title}
        </Heading>

        <PostUserActions post={post} />

        {post.coverImage ? (
          <Image
            src={resolveImageUrl(post.coverImage.id)}
            alt="Cover post"
            className="mt-10 size-full rounded-2 object-cover"
            placeholder={post.coverImage.blurhash ? "blur" : "empty"}
            blurDataURL={post.coverImage.blurhash}
            width={post.coverImage.width}
            height={post.coverImage.height}
          />
        ) : null}

        {post.content ? <PostMarkdownContent content={post.content} /> : null}

        {post.tags ? (
          <div className="mt-5 flex gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} color="orange">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <Separator size="4" className="my-10" />

        <PostCollectCard post={post} />

        <Separator size="4" className="my-10" />

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3 md:items-center">
          <PostInfoCard post={post} />
          <PostShareCard post={post} />
        </div>

        <PostUserInfoCard post={post} />
      </Container>
    </FadeSlideBottom>
  );
}
