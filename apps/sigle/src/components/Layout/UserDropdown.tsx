"use client";

import {
  IconLogout,
  IconMoon,
  IconPencil,
  IconSettings,
  IconSun,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStacksLogin } from "@/hooks/useStacksLogin";
import { useSession } from "@/lib/auth-hooks";
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

  const { data: userWhitelist } = sigleApiClient.useQuery(
    "get",
    "/api/protected/user/whitelisted",
  );

  const onThemeChange = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    posthog.capture("theme_change", { theme: newTheme });
  };

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="cursor-pointer transition hover:opacity-85"
          >
            <ProfileAvatar user={user} size="2" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        {userWhitelist?.whitelisted ? (
          <DropdownMenuItem
            render={
              <NextLink href="/p/new">
                <IconPencil size={16} /> Write a post
              </NextLink>
            }
          />
        ) : null}
        <DropdownMenuItem
          render={
            <NextLink href="/dashboard/settings">
              <IconSettings size={16} /> Settings
            </NextLink>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onThemeChange}>
          {resolvedTheme === "dark" ? (
            <>
              <IconSun size={16} /> Light
            </>
          ) : (
            <>
              <IconMoon size={16} /> Dark
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>
          <IconLogout size={16} /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
