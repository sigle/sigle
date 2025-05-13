"use client";

import { sigleApiClient } from "@/__generated__/sigle-api";
import { PostCard } from "@/components/Shared/Post/Card";

export const ExplorePostsList = () => {
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

  return (
    <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
