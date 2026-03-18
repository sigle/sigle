"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { formatReadableAddress } from "@/lib/stacks";
import { NextLink } from "../Shared/NextLink";
import { ProfileAvatar } from "../Shared/Profile/ProfileAvatar";
import { Button } from "../ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

export const HomeTrendingUsers = () => {
  const { data: users } = sigleApiClient.useSuspenseQuery(
    "get",
    "/api/users/trending",
  );

  return (
    <div className="mx-auto mt-10 max-w-6xl px-4 md:mt-20">
      <h3 className="text-lg font-bold">Discover</h3>

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
              <Card key={user.id} className="m-0.25">
                <CardContent className="flex flex-col items-center gap-2">
                  <NextLink href={Routes.userProfile({ username: user.id })}>
                    <ProfileAvatar user={user} size="8" />
                  </NextLink>

                  <p className="max-w-full truncate text-base font-medium">
                    {user.profile?.displayName
                      ? user.profile?.displayName
                      : formatReadableAddress(user.id)}
                  </p>

                  <div className="flex w-full flex-col gap-2">
                    <p className="text-xs text-muted-foreground">
                      {user.postsCount} posts
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full"
                      nativeButton={false}
                      render={
                        <NextLink
                          href={Routes.userProfile({ username: user.id })}
                        >
                          Discover
                        </NextLink>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
