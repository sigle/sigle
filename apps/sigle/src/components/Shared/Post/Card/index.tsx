"use client";

import type { paths } from "@sigle/sdk";
import { format } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resolveImageUrl } from "@/lib/images";
import { Routes } from "@/lib/routes";
import { formatReadableAddress } from "@/lib/stacks";
import { NextLink } from "../../NextLink";
import { PostCollectDialog } from "../PostCollectDialog";

interface PostCardProps {
  post: paths["/api/posts/list"]["get"]["responses"]["200"]["content"]["application/json"]["results"][number];
}

export const PostCard = ({ post }: PostCardProps) => {
  const [collectDialogOpen, setCollectDialogOpen] = useState(false);
  const canCollect =
    post.collectible &&
    (post.collectible.maxSupply === 0 ||
      post.collectible.collected < post.collectible.maxSupply);

  return (
    <Card className="relative m-0.25 pt-0">
      <div className="absolute inset-0 aspect-video bg-muted" />
      {post.coverImage ? (
        <NextLink href={Routes.post({ postId: post.id })}>
          <Image
            src={resolveImageUrl(post.coverImage.id)}
            alt="Cover card"
            className="relative aspect-video w-full object-cover"
            placeholder={post.coverImage.blurhash ? "blur" : "empty"}
            blurDataURL={post.coverImage.blurhash}
            width={post.coverImage.width}
            height={post.coverImage.height}
          />
        </NextLink>
      ) : (
        <div className="relative aspect-video w-full object-cover" />
      )}
      <CardContent>
        <div className="flex-1 space-y-2">
          <NextLink href={Routes.post({ postId: post.id })} className="block">
            <h3 className="line-clamp-2 text-lg font-bold wrap-break-word">
              {post.metaTitle || post.title}
            </h3>
          </NextLink>
          <NextLink href={Routes.post({ postId: post.id })} className="block">
            <p className="line-clamp-1 md:line-clamp-2">
              {post.metaDescription || post.excerpt}
            </p>
          </NextLink>
          <div className="mt-3">
            <p className="text-xs text-muted-foreground">
              By{" "}
              <NextLink
                className="text-primary underline decoration-muted-foreground/50 underline-offset-2"
                href={Routes.userProfile({ username: post.user.id })}
              >
                {post.user.profile?.displayName
                  ? post.user.profile?.displayName
                  : formatReadableAddress(post.user.id)}
              </NextLink>{" "}
              • {format(new Date(post.createdAt), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
        {post.collectible ? (
          <>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground">
                {post.collectible.openEdition
                  ? `${post.collectible.collected} collected`
                  : `${post.collectible.collected}/${post.collectible.maxSupply} collected`}
              </p>
              <Button
                variant="secondary"
                disabled={!canCollect}
                onClick={() => setCollectDialogOpen(true)}
              >
                Collect
              </Button>
            </div>
            <PostCollectDialog
              post={post}
              open={collectDialogOpen}
              onOpenChange={setCollectDialogOpen}
            />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};
