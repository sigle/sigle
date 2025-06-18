"use client";

import { DropdownMenu, IconButton } from "@radix-ui/themes";
import {
  IconLogout,
  IconMoon,
  IconPencil,
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { usePostHog } from "posthog-js/react";
import { useStacksLogin } from "@/hooks/useStacksLogin";
import { useSession } from "@/lib/auth-hooks";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { NextLink } from "../Shared/NextLink";
import { ProfileAvatar } from "../Shared/Profile/ProfileAvatar";

export const UserDropdown = () => {
  const posthog = usePostHog();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();
  const { logout } = useStacksLogin();

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

  const onThemeChange = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    posthog.capture("theme_change", { theme: newTheme });
  };

  if (!session) {
    return null;
  }

  // TODO: setup whitelisting logic
  const whitelisted = true;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" size="1">
          <ProfileAvatar user={user} size="2" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        color="gray"
        variant="soft"
        className="min-w-[150px]"
      >
        {whitelisted ? (
          <>
            <DropdownMenu.Item asChild>
              <NextLink href="/p/new">
                <IconPencil size={16} /> Write a post
              </NextLink>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <NextLink href="/dashboard/settings">
                <IconSettings size={16} /> Settings
              </NextLink>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <NextLink
                href={Routes.userProfile({
                  username: session.user.id,
                })}
              >
                <IconUser size={16} /> Profile
              </NextLink>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
          </>
        ) : null}
        <DropdownMenu.Item onClick={onThemeChange}>
          {resolvedTheme === "dark" ? (
            <>
              <IconSun size={16} /> Light
            </>
          ) : (
            <>
              <IconMoon size={16} /> Dark
            </>
          )}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={logout}>
          <IconLogout size={16} /> Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
