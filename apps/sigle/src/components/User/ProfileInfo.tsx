"use client";

import type { paths } from "@sigle/sdk";
import { IconLink } from "@tabler/icons-react";
import { prettifyUrl } from "@/lib/urls";
import { NextLink } from "../Shared/NextLink";
import { ProfileMarkdownDescription } from "../Shared/Profile/MarkdownDescription";

interface ProfileInfoProps {
  user: paths["/api/users/{username}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const ProfileInfo = ({ user }: ProfileInfoProps) => {
  return (
    <>
      <div className="mt-4 space-y-1">
        {user.profile?.displayName && (
          <p className="text-lg font-medium">{user.profile.displayName}</p>
        )}
        <p className="text-sm text-muted-foreground">{user.id}</p>
      </div>

      {user.profile?.description ? (
        <div className="mt-3 text-sm text-muted-foreground">
          <ProfileMarkdownDescription content={user.profile.description} />
        </div>
      ) : null}

      {user.profile && (user.profile.twitter || user.profile.website) ? (
        <div className="mt-3 flex items-center gap-4">
          {user.profile.twitter && (
            <NextLink
              className="text-sm text-muted-foreground underline-offset-2 hover:underline"
              href={`https://x.com/${user.profile.twitter}`}
              target="_blank"
              rel="noreferrer"
            >
              @{user.profile.twitter}
            </NextLink>
          )}

          {user.profile.website && (
            <NextLink
              className="text-sm text-muted-foreground underline-offset-2 hover:underline"
              href={user.profile.website}
              target="_blank"
              rel="noreferrer"
            >
              <div className="flex items-center gap-1">
                <IconLink size={16} />
                {prettifyUrl(user.profile.website)}
              </div>
            </NextLink>
          )}
        </div>
      ) : null}
    </>
  );
};
