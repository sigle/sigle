"use client";

import type { paths } from "@sigle/sdk";
import { IconLink } from "@tabler/icons-react";
import { usePostHog } from "posthog-js/react";
import { BlurImage } from "@/components/ui/blur-image";
import { Button, buttonVariants } from "@/components/ui/button";
import { env } from "@/env";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useSession } from "@/lib/auth-hooks";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { NextLink } from "../Shared/NextLink";
import { ProfileAvatar } from "../Shared/Profile/ProfileAvatar";

interface ProfileHeaderProps {
  user: paths["/api/users/{address}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const posthog = usePostHog();
  const { copyToClipboard } = useCopyToClipboard();
  const { data: session } = useSession();

  const { data: me } = sigleApiClient.useQuery(
    "get",
    "/api/me",
    {},
    { enabled: !!session },
  );

  const onCopyLink = () => {
    void copyToClipboard(
      `${env.NEXT_PUBLIC_APP_URL}${Routes.userProfile({ username: user.address })}`,
    );
    posthog.capture("profile_link_copied", {
      profileId: user.address,
    });
  };

  const isCurrentUser = me?.address === user.address;
  const coverPicture = user.profile?.coverPicture;

  return (
    <>
      {coverPicture ? (
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <div className="h-40 overflow-hidden rounded-lg bg-muted md:h-56">
            <BlurImage
              src={resolveImageUrl(coverPicture.url)}
              alt="Banner"
              sizes="(min-width: 896px) 896px, 100vw"
              className="size-full object-cover"
              thumbhash={coverPicture.thumbhash}
              width={coverPicture.width}
              height={coverPicture.height}
            />
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-2xl px-4">
        <div
          className={cn("flex items-end justify-between gap-4", {
            "-mt-10": coverPicture,
            "mt-12": !coverPicture,
          })}
        >
          <div className="rounded-md bg-background p-1">
            <ProfileAvatar user={user} size="6" />
          </div>

          <div className="flex items-center gap-1">
            {isCurrentUser ? (
              <NextLink
                href="/dashboard/settings"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Edit profile
              </NextLink>
            ) : null}
            <Button
              variant="ghost"
              size="icon-sm"
              title="Copy link to profile"
              aria-label="Copy link to profile"
              className="text-muted-foreground"
              onClick={onCopyLink}
            >
              <IconLink size={16} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
