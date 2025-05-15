"use client";

import { ProfileAvatar } from "@/components/Shared/Profile/ProfileAvatar";
import { useSession } from "@/lib/auth-hooks";
import { sigleApiClient } from "@/lib/sigle";
import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { IconPencil } from "@tabler/icons-react";
import { useState } from "react";
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
    <Card size="2">
      <div className="space-y-4">
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
          <Card size="1">
            <Flex gap="4" align="center">
              <ProfileAvatar user={user} size="3" />
              <Flex direction="column">
                {user.profile?.displayName ? (
                  <Text weight="medium">{user.profile.displayName}</Text>
                ) : null}
                <Text color="gray">{user.id}</Text>
              </Flex>
            </Flex>
          </Card>
        ) : (
          <UpdateProfileMetadata
            profile={user.profile}
            setEditingProfileMetadata={setEditingProfileMetadata}
          />
        )}
      </div>
    </Card>
  );
};
