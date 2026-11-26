"use client";

import { IconAlertTriangle } from "@tabler/icons-react";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { PostMarkdownContent } from "@/components/Post/MarkdownContent";
import { PostProvenanceCard } from "@/components/Post/ProvenanceCard";
import { PostUserActions } from "@/components/Post/UserActions";
import { PostUserInfoCard } from "@/components/Post/UserInfoCard";
import { FadeSlideBottom } from "@/components/ui";
import { BlurImage } from "@/components/ui/blur-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { CONTENT_WARNINGS, hidesPost } from "@/lib/content-warning";
import { resolveImageUrl } from "@/lib/images";
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
    // The page on the server hydrates this query with a fresh result.
    { staleTime: 60_000 },
  );

  // The reader chose to see a post behind a content warning, for this page
  // view only.
  const [isRevealed, setIsRevealed] = useState(false);

  if (!post) {
    notFound();
  }

  const warning = post.contentWarning
    ? CONTENT_WARNINGS[post.contentWarning]
    : null;

  const isCoverHidden = warning !== null && !isRevealed;

  const isPostHidden =
    post.contentWarning !== null &&
    hidesPost(post.contentWarning) &&
    !isRevealed;

  return (
    <FadeSlideBottom>
      {post.coverImage && !isPostHidden ? (
        <div className="mx-auto mt-6 max-w-4xl px-4">
          <div className="relative overflow-hidden rounded-lg">
            <BlurImage
              src={resolveImageUrl(post.coverImage.url)}
              alt="Cover post"
              sizes="(min-width: 896px) 864px, 100vw"
              // The cover is the largest element above the fold, so it is fetched first.
              preload
              className={cn("size-full object-cover", {
                "scale-110 blur-2xl": isCoverHidden,
              })}
              thumbhash={post.coverImage.thumbhash}
              width={post.coverImage.width}
              height={post.coverImage.height}
            />
            {isCoverHidden ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button variant="secondary" onClick={() => setIsRevealed(true)}>
                  Show cover
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mx-auto my-8 max-w-2xl px-4 md:my-10">
        <header className="mb-8 flex flex-col gap-4">
          {warning || post.tags.length > 0 ? (
            <p className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground uppercase">
              {warning ? (
                <>
                  <IconAlertTriangle size={14} aria-hidden />
                  {warning.label}
                </>
              ) : null}
              {warning && post.tags.length > 0 ? " · " : null}
              {post.tags.join(" · ")}
            </p>
          ) : null}

          <h1 className="headline text-4xl text-pretty md:text-5xl">
            {post.title}
          </h1>

          <PostUserActions post={post} />
        </header>

        {warning && isPostHidden ? (
          <div className="flex flex-col items-center rounded-lg border border-border px-6 py-12 text-center">
            <IconAlertTriangle
              size={24}
              className="text-muted-foreground"
              aria-hidden
            />
            <p className="mt-4 font-medium">
              The writer marked this story {warning.label}
            </p>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">
              {warning.description}
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setIsRevealed(true)}
            >
              Show anyway
            </Button>
          </div>
        ) : post.content ? (
          <PostMarkdownContent content={post.content} />
        ) : null}

        <div className="mt-16 space-y-12 border-t border-border pt-10">
          <PostUserInfoCard post={post} />

          <PostProvenanceCard post={post} />
        </div>
      </div>
    </FadeSlideBottom>
  );
}
