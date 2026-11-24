"use client";

import type { paths } from "@sigle/sdk";
import { formatReadableAddress } from "@/lib/stacks";
import { prettifyUrl } from "@/lib/urls";
import { ExplorerBadge } from "../Shared/Profile/ExplorerBadge";
import { ProfileMarkdownDescription } from "../Shared/Profile/MarkdownDescription";

interface ProfileInfoProps {
  user: paths["/api/users/{address}"]["get"]["responses"]["200"]["content"]["application/json"];
}

const linkClassName =
  "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

export const ProfileInfo = ({ user }: ProfileInfoProps) => {
  const { profile } = user;

  return (
    <div className="mt-4">
      <h1 className="headline text-3xl break-words">
        {profile?.displayName || formatReadableAddress(user.address)}
      </h1>
      {user.isExplorer ? (
        <ExplorerBadge variant="label" className="mt-2" />
      ) : null}
      <p className="mt-1 font-mono text-xs break-all text-muted-foreground">
        {user.address}
      </p>

      {profile?.description ? (
        <ProfileMarkdownDescription
          content={profile.description}
          className="mt-4 text-sm text-pretty text-muted-foreground"
        />
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {profile?.twitter ? (
          <a
            className={linkClassName}
            href={`https://x.com/${profile.twitter}`}
            target="_blank"
            rel="noreferrer"
          >
            @{profile.twitter}
          </a>
        ) : null}
        {profile?.website ? (
          <a
            className={linkClassName}
            href={profile.website}
            target="_blank"
            rel="noreferrer"
          >
            {prettifyUrl(profile.website)}
          </a>
        ) : null}
        <a
          className={linkClassName}
          href={`/api/feed/${user.address}`}
          target="_blank"
          rel="noreferrer"
        >
          RSS
        </a>
      </div>
    </div>
  );
};
