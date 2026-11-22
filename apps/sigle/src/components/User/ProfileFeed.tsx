"use client";

import type { paths } from "@sigle/sdk";
import { buttonVariants } from "@/components/ui/button";
import { useIsClient } from "@/hooks/useIsClient";
import { useSession } from "@/lib/auth-hooks";
import { sigleApiClient } from "@/lib/sigle";
import { GetFamiliarCards } from "../Dashboard/GetFamiliarCards";
import { NextLink } from "../Shared/NextLink";
import { PostListItem } from "../Shared/Post/ListItem";
import { PostListItemSkeleton } from "../Shared/Post/ListItem/Skeleton";

interface ProfileFeedProps {
  user: paths["/api/users/{address}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const ProfileFeed = ({ user }: ProfileFeedProps) => {
  const isClient = useIsClient();
  const { data: session } = useSession();

  const { data: me } = sigleApiClient.useQuery(
    "get",
    "/api/me",
    {},
    { enabled: !!session },
  );

  // TODO useSuspenseQuery or load more button to decide
  const { data: posts } = sigleApiClient.useSuspenseQuery("get", "/api/posts", {
    params: {
      query: {
        author: user.address,
        limit: 25,
      },
    },
  });

  // The server renders without the session, so the first client render must
  // not depend on it either: this component hydrates after its posts load, by
  // which time the client may already know the user.
  if (posts.results.length === 0 && isClient && user.address === me?.address) {
    return (
      <>
        <div className="my-20 flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            You haven&apos;t published anything yet.
          </p>
          <NextLink href="/p/new" className={buttonVariants()}>
            Start writing
          </NextLink>
        </div>

        <GetFamiliarCards />
      </>
    );
  }

  if (posts.results.length === 0) {
    return (
      <div className="my-20 flex flex-col items-center gap-3">
        <p>This user has not published anything yet.</p>
        <NextLink href="/" className={buttonVariants()}>
          Explore
        </NextLink>
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
