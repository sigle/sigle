"use client";

import type { paths } from "@sigle/sdk";
import { IconDotsVertical } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";
import { BlurImage } from "@/components/ui/blur-image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-hooks";
import { resolveImageUrl } from "@/lib/images";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { formatReadableAddress } from "@/lib/stacks";
import { NextLink } from "../../NextLink";
import { PostShareDialog } from "../PostShareDialog";

interface PostListItemProps {
  post: paths["/api/posts"]["get"]["responses"][200]["content"]["application/json"]["results"][number];
}

export const PostListItem = ({ post }: PostListItemProps) => {
  const { data: session } = useSession();

  const { data: me } = sigleApiClient.useQuery(
    "get",
    "/api/protected/me",
    {},
    { enabled: !!session },
  );

  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const isCurrentUser = me?.address === post.author.address;

  return (
    <div className="space-y-3 border-b border-solid border-border py-5 last:border-b-0">
      <div>
        <div className="flex justify-between gap-5">
          <div className="flex h-full flex-1 flex-col justify-between">
            <NextLink href={Routes.post({ postId: post.id })}>
              <h4
                className="mb-2 line-clamp-2 text-lg/tight font-medium"
                style={{
                  wordBreak: "break-word",
                }}
              >
                {post.metaTitle || post.title}
              </h4>
              <p className="line-clamp-1 text-sm text-muted-foreground md:line-clamp-2">
                {post.metaDescription || post.excerpt}
              </p>
            </NextLink>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                By{" "}
                <NextLink
                  className="text-primary underline decoration-muted-foreground/50 underline-offset-2"
                  href={Routes.userProfile({
                    username: post.author.address,
                  })}
                >
                  {post.author.profile?.displayName ||
                    formatReadableAddress(post.author.address)}
                </NextLink>{" "}
                • {format(new Date(post.createdAt), "MMM dd, yyyy")}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" title="More">
                      <IconDotsVertical size={14} />
                    </Button>
                  }
                />
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                    Share & Earn
                  </DropdownMenuItem>
                  {isCurrentUser ? (
                    <DropdownMenuItem
                      render={
                        <NextLink href={Routes.editPost({ postId: post.id })}>
                          Edit
                        </NextLink>
                      }
                    />
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {post.coverImage ? (
            <NextLink href={Routes.post({ postId: post.id })}>
              <div className="w-[100px] max-w-full overflow-hidden md:w-[200px]">
                <div className="aspect-16/10">
                  <BlurImage
                    src={resolveImageUrl(post.coverImage.url)}
                    alt="Cover card"
                    className="size-full rounded-md object-cover"
                    // server-v2 already optimizes cover images and serves
                    // them from its CDN, which is not a Next.js image host.
                    unoptimized
                    thumbhash={post.coverImage.thumbhash}
                    width={post.coverImage.width ?? undefined}
                    height={post.coverImage.height ?? undefined}
                  />
                </div>
              </div>
            </NextLink>
          ) : null}
        </div>
      </div>

      <PostShareDialog
        post={post}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </div>
  );
};
