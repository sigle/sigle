"use client";

import type { paths } from "@sigle/sdk";
import { IconDotsVertical, IconPencil } from "@tabler/icons-react";
import { usePostHog } from "posthog-js/react";
import { BlurImage } from "@/components/ui/blur-image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  user: paths["/api/users/{username}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const posthog = usePostHog();
  const { copyToClipboard } = useCopyToClipboard();
  const { data: session } = useSession();

  const { data: me } = sigleApiClient.useQuery(
    "get",
    "/api/protected/me",
    {},
    { enabled: !!session },
  );

  const onCopyLink = () => {
    copyToClipboard(
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
      <div
        className={cn("relative w-full bg-muted", {
          "h-64 md:h-88": coverPicture,
          "h-32": !coverPicture,
        })}
      >
        {coverPicture ? (
          <BlurImage
            src={resolveImageUrl(coverPicture.url)}
            alt="Banner"
            sizes="100vw"
            className="size-full object-cover"
            thumbhash={coverPicture.thumbhash}
            width={coverPicture.width}
            height={coverPicture.height}
          />
        ) : null}
      </div>

      <div className="mx-auto max-w-2xl px-4">
        <div className="flex justify-between">
          <div className="z-10 mt-[-70px] rounded-lg border-[6px] border-background bg-background">
            <ProfileAvatar user={user} size="8" />
          </div>

          <div className="mt-4 flex items-center gap-4">
            {isCurrentUser ? (
              <Button
                variant="secondary"
                nativeButton={false}
                render={<NextLink href="/dashboard/settings" />}
              >
                Edit profile <IconPencil size={16} />
              </Button>
            ) : null}

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" title="More">
                    <IconDotsVertical size={16} />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem onClick={onCopyLink}>
                  Copy link to profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
};
