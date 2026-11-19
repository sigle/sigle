"use client";

import type { paths } from "@sigle/sdk";
import { format } from "date-fns";
import { BlurImage } from "@/components/ui/blur-image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";
import { Routes } from "@/lib/routes";
import { formatReadableAddress } from "@/lib/stacks";
import { NextLink } from "../../NextLink";

interface PostCardProps {
  post: paths["/api/posts"]["get"]["responses"][200]["content"]["application/json"]["results"][number];
  className?: string;
}

export const PostCard = ({ post, className }: PostCardProps) => {
  return (
    <Card className={cn("relative pt-0", className)}>
      <div className="absolute inset-0 aspect-video bg-muted" />
      {post.coverImage ? (
        <NextLink href={Routes.post({ postId: post.id })}>
          <BlurImage
            src={resolveImageUrl(post.coverImage.url)}
            alt="Cover card"
            className="relative aspect-video w-full object-cover"
            // server-v2 already optimizes cover images and serves them from
            // its CDN, which is not a Next.js image host.
            unoptimized
            thumbhash={post.coverImage.thumbhash}
            width={post.coverImage.width ?? undefined}
            height={post.coverImage.height ?? undefined}
          />
        </NextLink>
      ) : (
        <div className="relative aspect-video w-full object-cover" />
      )}
      <CardContent className="flex h-full flex-col justify-between">
        <div>
          <h3
            className="mb-1 line-clamp-2 text-lg/tight font-medium"
            style={{
              wordBreak: "break-word",
            }}
          >
            <NextLink href={Routes.post({ postId: post.id })}>
              {post.metaTitle || post.title}
            </NextLink>
          </h3>
          <p className="line-clamp-1 text-sm text-muted-foreground md:line-clamp-2">
            <NextLink href={Routes.post({ postId: post.id })}>
              {post.metaDescription || post.excerpt}
            </NextLink>
          </p>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          By{" "}
          <NextLink
            className="text-primary underline decoration-muted-foreground/50 underline-offset-2"
            href={Routes.userProfile({ username: post.author.address })}
          >
            {post.author.profile?.displayName ||
              formatReadableAddress(post.author.address)}
          </NextLink>{" "}
          • {format(new Date(post.createdAt), "MMM dd, yyyy")}
        </p>
      </CardContent>
    </Card>
  );
};
