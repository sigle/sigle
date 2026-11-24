import type { paths } from "@sigle/sdk";
import { IconDots, IconShare } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-hooks";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { formatReadableAddress } from "@/lib/stacks";
import { NextLink } from "../Shared/NextLink";
import { HidePostDialog } from "../Shared/Post/HidePostDialog";
import { PostShareDialog } from "../Shared/Post/PostShareDialog";
import { ExplorerBadge } from "../Shared/Profile/ExplorerBadge";
import { ProfileAvatar } from "../Shared/Profile/ProfileAvatar";

interface PostUserActionsProps {
  post: paths["/api/posts/{postId}"]["get"]["responses"]["200"]["content"]["application/json"];
}

/** Words read per minute, used to estimate the reading time. */
const WORDS_PER_MINUTE = 230;

export const PostUserActions = ({ post }: PostUserActionsProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { data: me } = sigleApiClient.useQuery(
    "get",
    "/api/me",
    {},
    { enabled: !!session },
  );

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const { author } = post;
  const isAuthor = me?.address === author.address;

  // A hidden story is a 404, its author included, so they land on the list
  // where they can show it again.
  const onHiddenChange = (postId: string, hidden: boolean) => {
    if (!hidden) {
      return;
    }

    queryClient.removeQueries({
      queryKey: sigleApiClient.queryOptions("get", "/api/posts/{postId}", {
        params: { path: { postId } },
      }).queryKey,
    });
    router.push("/dashboard/published");
  };

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
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setShareDialogOpen(true)}
          >
            <IconShare size={16} /> Share
          </Button>
          {isAuthor ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Story actions"
                    className="text-muted-foreground"
                  >
                    <IconDots size={16} />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setHideDialogOpen(true)}>
                  Hide story
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      <PostShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        post={post}
      />

      {isAuthor ? (
        <HidePostDialog
          post={post}
          open={hideDialogOpen}
          onOpenChange={setHideDialogOpen}
          onChange={onHiddenChange}
        />
      ) : null}
    </>
  );
};
