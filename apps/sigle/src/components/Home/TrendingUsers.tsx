"use client";

import { Button, Card, Container, Heading, Text } from "@radix-ui/themes";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { formatReadableAddress } from "@/lib/stacks";
import { NextLink } from "../Shared/NextLink";
import { ProfileAvatar } from "../Shared/Profile/ProfileAvatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui";

export const HomeTrendingUsers = () => {
  const { data: users } = sigleApiClient.useSuspenseQuery(
    "get",
    "/api/users/trending",
  );

  return (
    <Container size="4" className="mt-10 px-4 md:mt-20">
      <Heading as="h3" size="4">
        Discover
      </Heading>

      <Carousel
        className="mt-4 w-full"
        opts={{
          align: "start",
        }}
      >
        <CarouselContent>
          {users.map((user) => (
            <CarouselItem
              key={user.id}
              className="basis-1/2 md:basis-1/5 lg:basis-1/6"
            >
              <Card
                key={user.id}
                size="2"
                className="flex flex-col items-center gap-2 p-5"
              >
                <NextLink href={Routes.userProfile({ username: user.id })}>
                  <ProfileAvatar user={user} size="8" />
                </NextLink>
                <Text
                  as="p"
                  size="3"
                  weight="medium"
                  className="max-w-full truncate"
                >
                  {user.profile?.displayName
                    ? user.profile?.displayName
                    : formatReadableAddress(user.id)}
                </Text>

                <div className="mt-5 flex w-full flex-col gap-2">
                  <Text as="p" size="1" color="gray">
                    {user.postsCount} posts
                  </Text>
                  <Button color="gray" variant="soft" className="w-full">
                    <NextLink href={Routes.userProfile({ username: user.id })}>
                      Discover
                    </NextLink>
                  </Button>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious color="gray" highContrast />
        <CarouselNext color="gray" highContrast />
      </Carousel>
    </Container>
  );
};
