"use client";

import type { paths } from "@/__generated__/sigle-api/openapi";
import { prettifyUrl } from "@/lib/urls";
import { Heading, Link, Text } from "@radix-ui/themes";
import { IconLink } from "@tabler/icons-react";
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
          <Heading size="6">{user.profile.displayName}</Heading>
        )}
        <Text as="p" color="gray" size="2">
          {user.id}
        </Text>
      </div>

      {user.profile?.description ? (
        <Text mt="3" as="p" color="gray" size="2" asChild>
          <ProfileMarkdownDescription content={user.profile.description} />
        </Text>
      ) : null}

      {user.profile && (user.profile.twitter || user.profile.website) ? (
        <div className="mt-3 flex items-center gap-4">
          {user.profile.twitter && (
            <Link asChild size="2">
              <NextLink
                href={`https://x.com/${user.profile.twitter}`}
                target="_blank"
              >
                @{user.profile.twitter}
              </NextLink>
            </Link>
          )}

          {user.profile.website && (
            <Link asChild size="2">
              <NextLink href={user.profile.website} target="_blank">
                <div className="flex items-center gap-1">
                  <IconLink size={16} />
                  {prettifyUrl(user.profile.website)}
                </div>
              </NextLink>
            </Link>
          )}
        </div>
      ) : null}
    </>
  );
};
