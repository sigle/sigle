"use client";

import { IconPencil } from "@tabler/icons-react";
import { useState } from "react";
import { ProfileAvatar } from "@/components/Shared/Profile/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth-hooks";
import { sigleApiClient } from "@/lib/sigle";
import { UpdateProfileMetadata } from "./UpdateProfileMetadata";

export const SettingsProfileMetadata = () => {
  const [editingProfileMetadata, setEditingProfileMetadata] = useState(false);
  const { data: session } = useSession();
  const { data: user } = sigleApiClient.useSuspenseQuery(
    "get",
    "/api/users/{username}",
    {
      params: {
        path: {
          username: session?.user.id || "",
        },
      },
    },
  );
  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-bold">Profile</h2>
            <p className="text-muted-foreground">
              The informations of your profile on Sigle
            </p>
          </div>
          {!editingProfileMetadata ? (
            <Button
              variant="secondary"
              onClick={() => setEditingProfileMetadata(true)}
            >
              <IconPencil size={16} />
              Edit
            </Button>
          ) : null}
        </div>

        {!editingProfileMetadata ? (
          <Card size="sm">
            <CardContent className="flex items-center gap-4">
              <ProfileAvatar user={user} size="3" />
              <div className="flex flex-col">
                {user.profile?.displayName ? (
                  <p className="font-medium">{user.profile.displayName}</p>
                ) : null}
                <p className="text-muted-foreground">{user.id}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <UpdateProfileMetadata
            profile={user.profile}
            setEditingProfileMetadata={setEditingProfileMetadata}
          />
        )}
      </CardContent>
    </Card>
  );
};
