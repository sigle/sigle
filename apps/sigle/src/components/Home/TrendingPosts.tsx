"use client";

import { sigleApiClient } from "@/lib/sigle";
import { PostCard } from "../Shared/Post/Card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

export const HomeTrendingPosts = () => {
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
    <div className="mx-auto mt-10 max-w-6xl px-4 md:mt-20">
      <h3 className="text-lg font-bold">Trending</h3>

      <Carousel className="mt-4">
        <CarouselContent className="p-0.25">
          {posts.results.map((post) => (
            <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/4">
              <PostCard className="h-full" post={post} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
