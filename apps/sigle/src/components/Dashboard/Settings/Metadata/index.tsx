"use client";

import { useState } from "react";
import { ProfileMarkdownDescription } from "@/components/Shared/Profile/MarkdownDescription";
import { ProfileAvatar } from "@/components/Shared/Profile/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { sigleApiClient } from "@/lib/sigle";
import { UpdateProfileMetadata } from "./UpdateProfileMetadata";

export const SettingsProfileMetadata = () => {
  const [editingProfileMetadata, setEditingProfileMetadata] = useState(false);

  const { data: me } = sigleApiClient.useQuery("get", "/api/me");

  const { data: user } = sigleApiClient.useQuery(
    "get",
    "/api/users/{address}",
    {
      params: { path: { address: me?.address ?? "" } },
      // The profile response is cacheable for 60s, revalidate so edits show up
      // right away.
      cache: "no-cache",
    },
    { enabled: !!me?.address },
  );

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="headline text-2xl">Profile</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            How you appear on your blog. Saving asks your wallet to sign the
            update, which is then archived on Arweave.
          </p>
        </div>
        {user && !editingProfileMetadata ? (
          <Button
            variant="outline"
            onClick={() => setEditingProfileMetadata(true)}
          >
            Edit
          </Button>
        ) : null}
      </div>

      <div className="mt-4 border-t border-border">
        {!user ? (
          <div className="flex items-center gap-4 border-b border-border py-5">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
        ) : null}

        {user && !editingProfileMetadata ? (
          <div className="flex items-center gap-4 border-b border-border py-5">
            <ProfileAvatar user={user} size="3" />
            <div className="min-w-0">
              <p
                className={
                  user.profile?.displayName
                    ? "text-sm font-medium"
                    : "text-sm text-muted-foreground"
                }
              >
                {user.profile?.displayName || "No name yet"}
              </p>
              {user.profile?.description ? (
                <ProfileMarkdownDescription
                  content={user.profile.description}
                  className="line-clamp-1 text-sm text-muted-foreground"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add a picture, a bio and links so readers know who you are.
                </p>
              )}
            </div>
          </div>
        ) : null}

        {user && editingProfileMetadata ? (
          <UpdateProfileMetadata
            profile={user.profile}
            setEditingProfileMetadata={setEditingProfileMetadata}
          />
        ) : null}
      </div>
    </section>
  );
};
