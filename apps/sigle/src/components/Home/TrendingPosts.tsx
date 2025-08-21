"use client";

import { Container, Heading } from "@radix-ui/themes";
import { sigleApiClient } from "@/lib/sigle";
import { PostCard } from "../Shared/Post/Card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui";

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
    <Container size="4" className="mt-10 px-4 md:mt-20">
      <Heading as="h3" size="5">
        Trending
      </Heading>

      <Carousel
        className="mt-4 w-full"
        opts={{
          align: "start",
        }}
      >
        <CarouselContent>
          {posts.results.map((post) => (
            <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/4">
              <PostCard post={post} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious color="gray" highContrast />
        <CarouselNext color="gray" highContrast />
      </Carousel>
    </Container>
  );
};
