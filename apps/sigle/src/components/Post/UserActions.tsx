import type { paths } from "@sigle/sdk";
import { Button, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { IconShare } from "@tabler/icons-react";
import { useState } from "react";
import { Routes } from "@/lib/routes";
import { formatReadableAddress } from "@/lib/stacks";
import { NextLink } from "../Shared/NextLink";
import { PostCollectDialog } from "../Shared/Post/PostCollectDialog";
import { PostShareDialog } from "../Shared/Post/PostShareDialog";
import { ProfileAvatar } from "../Shared/Profile/ProfileAvatar";

interface PostUserActionsProps {
  post: paths["/api/posts/{postId}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const PostUserActions = ({ post }: PostUserActionsProps) => {
  const [collectDialogOpen, setCollectDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const canCollect = post.collectible
    ? post.collectible.maxSupply === 0 ||
      post.collectible.collected < post.collectible.maxSupply
    : false;

  // TODO add published time + read time under user name in the format "Mar 1, 2026 (clock icon) 6 min read"

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NextLink href={Routes.userProfile({ username: post.user.id })}>
            <ProfileAvatar user={post.user} size="2" />
          </NextLink>
          <div className="grid gap-0.5">
            <Text size="2" weight="medium" asChild>
              <NextLink href={Routes.userProfile({ username: post.user.id })}>
                {post.user.profile?.displayName}
              </NextLink>
            </Text>
            <Text size="1" color="gray" title={post.user.id} asChild>
              <NextLink href={Routes.userProfile({ username: post.user.id })}>
                {formatReadableAddress(post.user.id)}
              </NextLink>
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {post.collectible ? (
            <>
              <Tooltip content="Share">
                <IconButton
                  variant="ghost"
                  color="gray"
                  size="2"
                  onClick={() => setShareDialogOpen(true)}
                >
                  <IconShare size={16} />
                </IconButton>
              </Tooltip>
              <Button
                color="gray"
                highContrast
                disabled={!canCollect}
                onClick={() => setCollectDialogOpen(true)}
              >
                Collect
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              color="gray"
              size="2"
              onClick={() => setShareDialogOpen(true)}
            >
              <IconShare size={16} /> Share
            </Button>
          )}
        </div>
      </div>

      <PostShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        post={post}
      />
      {post.collectible ? (
        <PostCollectDialog
          post={post}
          open={collectDialogOpen}
          onOpenChange={setCollectDialogOpen}
        />
      ) : null}
    </>
  );
};
