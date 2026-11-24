import type { paths } from "@sigle/sdk";
import { IconShare } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Routes } from "@/lib/routes";
import { formatReadableAddress } from "@/lib/stacks";
import { NextLink } from "../Shared/NextLink";
import { PostShareDialog } from "../Shared/Post/PostShareDialog";
import { ExplorerBadge } from "../Shared/Profile/ExplorerBadge";
import { ProfileAvatar } from "../Shared/Profile/ProfileAvatar";

interface PostUserActionsProps {
  post: paths["/api/posts/{postId}"]["get"]["responses"]["200"]["content"]["application/json"];
}

/** Words read per minute, used to estimate the reading time. */
const WORDS_PER_MINUTE = 230;

export const PostUserActions = ({ post }: PostUserActionsProps) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { author } = post;
  const profileHref = Routes.userProfile({ username: author.address });

  const words = post.content.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <NextLink href={profileHref} className="shrink-0">
            <ProfileAvatar user={author} size="3" />
          </NextLink>
          <div className="min-w-0 text-sm">
            {/* The seal sits outside the truncated link, so long names keep it. */}
            <div className="flex min-w-0 items-center gap-1.5">
              <NextLink
                href={profileHref}
                title={author.address}
                className="truncate font-medium underline-offset-4 hover:underline"
              >
                {author.profile?.displayName ||
                  formatReadableAddress(author.address)}
              </NextLink>
              {author.isExplorer ? <ExplorerBadge /> : null}
            </div>
            <p className="text-muted-foreground">
              <time dateTime={post.createdAt}>
                {format(new Date(post.createdAt), "MMM d, yyyy")}
              </time>{" "}
              · {readingMinutes} min read
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setShareDialogOpen(true)}
        >
          <IconShare size={16} /> Share
        </Button>
      </div>

      <PostShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        post={post}
      />
    </>
  );
};
