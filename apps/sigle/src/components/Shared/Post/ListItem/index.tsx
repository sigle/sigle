"use client";

import type { paths } from "@sigle/sdk";
import { AspectRatio, Flex } from "@radix-ui/themes";
import { IconDotsVertical } from "@tabler/icons-react";
import { format } from "date-fns";
import Image from "next/image";
import { useState } from "react";
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
import { formatReadableAddress } from "@/lib/stacks";
import { NextLink } from "../../NextLink";
import { PostShareDialog } from "../PostShareDialog";

interface PostListItemProps {
  post: paths["/api/posts/list"]["get"]["responses"]["200"]["content"]["application/json"]["results"][number];
}

export const PostListItem = ({ post }: PostListItemProps) => {
  const { data: session } = useSession();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const isCurrentUser = session?.user.id === post.user.id;

  return (
    <div className="space-y-3 border-b border-solid border-gray-6 py-5 last:border-b-0">
      <div>
        <Flex gap="5" align="center" justify="between">
          <div className="flex-1 space-y-2">
            <NextLink href={Routes.post({ postId: post.id })} className="block">
              <h4
                className="line-clamp-2 text-lg font-medium"
                style={{
                  wordBreak: "break-word",
                }}
              >
                {post.metaTitle || post.title}
              </h4>
            </NextLink>
            <NextLink href={Routes.post({ postId: post.id })} className="block">
              <p className="line-clamp-1 text-sm text-muted-foreground md:line-clamp-2">
                {post.metaDescription || post.excerpt}
              </p>
            </NextLink>
            <div className="mt-3 flex items-center gap-2">
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
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon" title="More">
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
                <AspectRatio ratio={16 / 10}>
                  <Image
                    src={resolveImageUrl(post.coverImage.id)}
                    alt="Cover card"
                    className="size-full rounded-2 object-cover"
                    placeholder={post.coverImage.blurhash ? "blur" : "empty"}
                    blurDataURL={post.coverImage.blurhash}
                    width={post.coverImage.width}
                    height={post.coverImage.height}
                  />
                </AspectRatio>
              </div>
            </NextLink>
          ) : null}
        </Flex>
      </div>

      <PostShareDialog
        post={post}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </div>
  );
};
