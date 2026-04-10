"use client";

import type { paths } from "@sigle/sdk";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-hooks";
import { sigleApiClient } from "@/lib/sigle";
import { GetFamiliarCards } from "../Dashboard/GetFamiliarCards";
import { NextLink } from "../Shared/NextLink";
import { PostListItem } from "../Shared/Post/ListItem";
import { PostListItemSkeleton } from "../Shared/Post/ListItem/Skeleton";

interface ProfileFeedProps {
  user: paths["/api/users/{username}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const ProfileFeed = ({ user }: ProfileFeedProps) => {
  const { data: session } = useSession();
  // TODO useSuspenseQuery or load more button to decide
  const { data: posts } = sigleApiClient.useSuspenseQuery(
    "get",
    "/api/posts/list",
    {
      params: {
        query: {
          username: user.id,
          limit: 25,
        },
      },
    },
  );

  if (posts.results.length === 0 && user.id === session?.user.id) {
    return (
      <>
        <div className="my-20 flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            You haven&apos;t published anything yet.
          </p>
          <Button nativeButton={false} render={<NextLink href="/p/new" />}>
            Start writing
          </Button>
        </div>

        <GetFamiliarCards />
      </>
    );
  }

  if (posts.results.length === 0) {
    return (
      <div className="my-20 flex flex-col items-center gap-3">
        <p>This user has not published anything yet.</p>
        <Button nativeButton={false} render={<NextLink href="/" />}>
          Explore
        </Button>
      </div>
    );
  }

  return (
    <div>
      {posts.results.map((post) => {
        return <PostListItem key={post.id} post={post} />;
      })}
    </div>
  );
};

export const ProfileFeedSkeleton = () => {
  return (
    <div className="flex flex-col">
      <PostListItemSkeleton />
      <PostListItemSkeleton />
      <PostListItemSkeleton />
    </div>
  );
};
