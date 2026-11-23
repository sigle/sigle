"use client";

import type { paths } from "@sigle/sdk";
import { buttonVariants } from "@/components/ui/button";
import { useIsClient } from "@/hooks/useIsClient";
import { useSession } from "@/lib/auth-hooks";
import { cn } from "@/lib/cn";
import { sigleApiClient } from "@/lib/sigle";
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
      <section className="mt-4 border-y border-border py-14 text-center">
        <h3 className="headline text-2xl">Write your first story</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-pretty text-muted-foreground">
          Your published stories show up here, archived on Arweave and
          timestamped on Bitcoin.
        </p>
        <NextLink
          href="/p/new"
          className={cn(buttonVariants({ size: "lg" }), "mt-6")}
        >
          Start writing
        </NextLink>
      </section>
    );
  }

  if (posts.results.length === 0) {
    return (
      <p className="mt-4 border-y border-border py-6 text-sm text-muted-foreground">
        Nothing published yet.
      </p>
    );
  }

  return (
    <ul className="mt-4 border-t border-border">
      {posts.results.map((post) => (
        <PostListItem key={post.id} post={post} />
      ))}
    </ul>
  );
};

export const ProfileFeedSkeleton = () => (
  <ul className="mt-4 border-t border-border">
    <PostListItemSkeleton />
    <PostListItemSkeleton />
    <PostListItemSkeleton />
  </ul>
);
