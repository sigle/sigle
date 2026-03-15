"use client";

import { Button, Heading, Text } from "@radix-ui/themes";
import { IconPencil } from "@tabler/icons-react";
import { useState } from "react";
import { ProfileAvatar } from "@/components/Shared/Profile/ProfileAvatar";
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
            <Heading size="3">Profile</Heading>
            <Text size="2" color="gray">
              The informations of your profile on Sigle
            </Text>
          </div>
          {!editingProfileMetadata ? (
            <Button
              variant="soft"
              color="gray"
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
                  <Text weight="medium">{user.profile.displayName}</Text>
                ) : null}
                <Text color="gray">{user.id}</Text>
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
