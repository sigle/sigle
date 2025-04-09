"use client";

import type { paths } from "@/__generated__/sigle-api/openapi";
import { useSession } from "@/lib/auth-client";
import { resolveImageUrl } from "@/lib/images";
import { Routes } from "@/lib/routes";
import { formatReadableAddress } from "@/lib/stacks";
import {
  AspectRatio,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Link,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { IconDotsVertical } from "@tabler/icons-react";
import { format } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import { NextLink } from "../../NextLink";
import { PostShareDialog } from "../PostShareDialog";

interface PostListItemProps {
  post: paths["/api/posts/list"]["get"]["responses"]["200"]["content"]["application/json"][0];
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
              <Heading
                size="4"
                className="line-clamp-2 break-words"
                style={{
                  wordBreak: "break-word",
                }}
              >
                {post.metaTitle || post.title}
              </Heading>
            </NextLink>
            <NextLink href={Routes.post({ postId: post.id })} className="block">
              <Text as="p" size="2" className="line-clamp-1 md:line-clamp-2">
                {post.metaDescription || post.excerpt}
              </Text>
            </NextLink>
            <div className="mt-3 flex gap-2">
              <Text as="p" color="gray" size="1">
                By{" "}
                <Link asChild>
                  <NextLink
                    href={Routes.userProfile({ username: post.user.id })}
                  >
                    {post.user.profile?.displayName
                      ? post.user.profile?.displayName
                      : formatReadableAddress(post.user.id)}
                  </NextLink>
                </Link>{" "}
                • {format(new Date(post.createdAt), "MMM dd, yyyy")}
              </Text>
              <DropdownMenu.Root>
                <Tooltip content="More">
                  <DropdownMenu.Trigger>
                    <IconButton variant="ghost" color="gray" size="1">
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </DropdownMenu.Trigger>
                </Tooltip>
                <DropdownMenu.Content variant="soft" color="gray" highContrast>
                  <DropdownMenu.Item onClick={() => setShareDialogOpen(true)}>
                    Share & Earn
                  </DropdownMenu.Item>
                  {isCurrentUser ? (
                    <DropdownMenu.Item asChild>
                      <NextLink href={Routes.editPost({ postId: post.id })}>
                        Edit
                      </NextLink>
                    </DropdownMenu.Item>
                  ) : null}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
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
