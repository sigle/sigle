"use client";

import { sigleApiClient } from "@/__generated__/sigle-api";
import {
  ProfileFeed,
  ProfileFeedSkeleton,
} from "@/components/User/ProfileFeed";
import { ProfileHeader } from "@/components/User/ProfileHeader";
import { ProfileInfo } from "@/components/User/ProfileInfo";
import { FadeSlideBottom } from "@/components/ui";
import { Container, Heading } from "@radix-ui/themes";
import { notFound } from "next/navigation";
import { Suspense, use } from "react";

type Props = {
  params: Promise<{ username: string }>;
};

export function UserClientPage(props: Props) {
  const params = use(props.params);

  const { data: user } = sigleApiClient.useSuspenseQuery(
    "get",
    "/api/users/{username}",
    {
      params: {
        path: {
          username: params.username,
        },
      },
    },
  );
  if (!user) {
    notFound();
  }

  return (
    <FadeSlideBottom>
      <ProfileHeader user={user} />
      <Container size="2" className="mt-4 px-4 pb-20">
        <ProfileInfo user={user} />

        <Heading className="mt-10" size="5">
          Latest posts
        </Heading>

        <Suspense fallback={<ProfileFeedSkeleton />}>
          <ProfileFeed user={user} />
        </Suspense>
      </Container>
    </FadeSlideBottom>
  );
}
