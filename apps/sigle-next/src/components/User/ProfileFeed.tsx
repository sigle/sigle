import { sigleApiClient } from "@/__generated__/sigle-api";
import type { paths } from "@/__generated__/sigle-api/openapi";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useSession } from "next-auth/react";
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

  if (posts?.length === 0 && user.id === session?.user.id) {
    return (
      <>
        <div className="my-20 flex flex-col items-center gap-3">
          <Text size="2" color="gray" weight="medium">
            You haven{"'"}t published anything yet.
          </Text>
          <Button color="gray" highContrast asChild>
            <NextLink href="/p/new">Start writing</NextLink>
          </Button>
        </div>

        <GetFamiliarCards />
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="my-20 flex flex-col items-center gap-3">
        <Text>This user has not published anything yet.</Text>
        <Button color="gray" highContrast asChild>
          <NextLink href="/">Explore</NextLink>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => {
        return <PostListItem key={post.id} post={post} />;
      })}
    </div>
  );
};

export const ProfileFeedSkeleton = () => {
  return (
    <Flex direction="column">
      <PostListItemSkeleton />
      <PostListItemSkeleton />
      <PostListItemSkeleton />
    </Flex>
  );
};
