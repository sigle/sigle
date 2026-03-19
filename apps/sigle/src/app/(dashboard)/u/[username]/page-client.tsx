"use client";

import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import { FadeSlideBottom } from "@/components/ui";
import {
  ProfileFeed,
  ProfileFeedSkeleton,
} from "@/components/User/ProfileFeed";
import { ProfileHeader } from "@/components/User/ProfileHeader";
import { ProfileInfo } from "@/components/User/ProfileInfo";
import { sigleApiClient } from "@/lib/sigle";

interface Props {
  params: Promise<{ username: string }>;
}

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
      <div className="mx-auto mt-4 max-w-2xl px-4 pb-20">
        <ProfileInfo user={user} />

        <h3 className="mt-10 text-base font-medium">Latest posts</h3>

        <Suspense fallback={<ProfileFeedSkeleton />}>
          <ProfileFeed user={user} />
        </Suspense>
      </div>
    </FadeSlideBottom>
  );
}
