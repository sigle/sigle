import type { paths } from "@sigle/sdk";
import { IconShare } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
            <NextLink href={Routes.userProfile({ username: post.user.id })}>
              <p className="text-sm font-medium">
                {post.user.profile?.displayName}
              </p>
            </NextLink>
            <NextLink href={Routes.userProfile({ username: post.user.id })}>
              <p className="text-xs text-muted-foreground" title={post.user.id}>
                {formatReadableAddress(post.user.id)}
              </p>
            </NextLink>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {post.collectible ? (
            <>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShareDialogOpen(true)}
                    >
                      <IconShare size={16} />
                    </Button>
                  }
                />
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
              <Button
                disabled={!canCollect}
                onClick={() => setCollectDialogOpen(true)}
              >
                Collect
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setShareDialogOpen(true)}>
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
