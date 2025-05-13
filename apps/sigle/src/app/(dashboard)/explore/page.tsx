"use client";

import { sigleApiClient } from "@/__generated__/sigle-api";
import { PostCard } from "@/components/Shared/Post/Card";
import { Container, Heading, Text } from "@radix-ui/themes";

export const dynamic = "force-dynamic";

export default function ExplorePage() {
  const { data: posts } = sigleApiClient.useSuspenseQuery(
    "get",
    "/api/posts/list",
    {
      params: {
        query: {
          limit: 20,
        },
      },
    },
  );

  // TODO pagination

  return (
    <Container size="4" className="px-4 py-10">
      <Heading as="h1" size="5">
        Explore
      </Heading>
      <Text as="p" color="gray" size="2" className="mt-2">
        Discover the latest posts
      </Text>

      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </Container>
  );
}
