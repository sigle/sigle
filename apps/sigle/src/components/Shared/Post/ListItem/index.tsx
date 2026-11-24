"use client";

import type { paths } from "@sigle/sdk";
import { IconAlertTriangle, IconDots } from "@tabler/icons-react";
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
import { cn } from "@/lib/cn";
import { CONTENT_WARNINGS } from "@/lib/content-warning";
import { resolveImageUrl } from "@/lib/images";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { NextLink } from "../../NextLink";
import { HidePostDialog } from "../HidePostDialog";
import { PostShareDialog } from "../PostShareDialog";

interface PostListItemProps {
  post: paths["/api/posts"]["get"]["responses"][200]["content"]["application/json"]["results"][number];
  /** Called once the author hides the post, or shows it again. */
  onHiddenChange?: (postId: string, hidden: boolean) => void;
}

export const PostListItem = ({ post, onHiddenChange }: PostListItemProps) => {
  const { data: session } = useSession();

  const { data: me } = sigleApiClient.useQuery(
    "get",
    "/api/me",
    {},
    { enabled: !!session },
  );

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [hideDialogOpen, setHideDialogOpen] = useState(false);

  const isCurrentUser = me?.address === post.author.address;

  const warning = post.contentWarning
    ? CONTENT_WARNINGS[post.contentWarning]
    : null;

  const href = Routes.post({ postId: post.id });

  return (
    <li className="flex gap-6 border-b border-border py-6">
      <div className="min-w-0 flex-1">
        <NextLink href={href} className="group block">
          <h3 className="line-clamp-2 headline text-xl/tight break-words underline-offset-4 group-hover:underline">
            {post.metaTitle || post.title}
          </h3>
          {/* A post behind a content warning does not show what it says. */}
          {warning ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <IconAlertTriangle size={14} className="shrink-0" aria-hidden />
              Content warning: {warning.label}
            </p>
          ) : (
            <p className="mt-2 line-clamp-2 text-sm text-pretty text-muted-foreground">
              {post.metaDescription || post.excerpt}
            </p>
          )}
        </NextLink>

        <div className="mt-3 flex items-center gap-1">
          <time
            dateTime={post.createdAt}
            className="font-mono text-xs text-muted-foreground uppercase"
          >
            {format(new Date(post.createdAt), "MMM d, yyyy")}
          </time>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Post actions"
                  className="text-muted-foreground"
                >
                  <IconDots size={14} />
                </Button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                Share
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
              {isCurrentUser ? (
                <DropdownMenuItem onClick={() => setHideDialogOpen(true)}>
                  Hide story
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {post.coverImage ? (
        <NextLink href={href} className="shrink-0">
          <div className="aspect-16/10 w-24 overflow-hidden rounded-md bg-muted md:w-40">
            <BlurImage
              src={resolveImageUrl(post.coverImage.url)}
              alt="Cover card"
              className={cn("size-full object-cover", {
                "scale-110 blur-lg": warning,
              })}
              thumbhash={post.coverImage.thumbhash}
              width={post.coverImage.width}
              height={post.coverImage.height}
            />
          </div>
        </NextLink>
      ) : null}

      <PostShareDialog
        post={post}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />

      {isCurrentUser ? (
        <HidePostDialog
          post={post}
          open={hideDialogOpen}
          onOpenChange={setHideDialogOpen}
          onChange={onHiddenChange}
        />
      ) : null}
    </li>
  );
};
