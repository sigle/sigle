"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStacksLogin } from "@/hooks/useStacksLogin";
import { useSession } from "@/lib/auth-hooks";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { formatReadableAddress } from "@/lib/stacks";
import { NextLink } from "../Shared/NextLink";
import { ProfileAvatar } from "../Shared/Profile/ProfileAvatar";

export const UserDropdown = () => {
  const posthog = usePostHog();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();
  const { logout } = useStacksLogin();

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
            aria-label="Account menu"
            className="cursor-pointer rounded-md transition outline-none hover:opacity-85 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ProfileAvatar
              user={user ?? { address: me?.address ?? session.user.id }}
              size="2"
            />
          </button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        {me?.address ? (
          <>
            <div className="px-1.5 pt-1 pb-2">
              {user?.profile?.displayName ? (
                <p className="mb-0.5 truncate text-sm font-medium">
                  {user.profile.displayName}
                </p>
              ) : null}
              <p className="font-mono text-xs text-muted-foreground">
                {formatReadableAddress(me.address)}
              </p>
            </div>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {me?.whitelisted ? (
          <DropdownMenuItem
            render={
              <NextLink href="/p/new">
                <IconPencil className="text-muted-foreground" /> Write a post
              </NextLink>
            }
          />
        ) : null}
        {me?.address ? (
          <DropdownMenuItem
            render={
              <NextLink href={Routes.userProfile({ username: me.address })}>
                <IconUser className="text-muted-foreground" /> View blog
              </NextLink>
            }
          />
        ) : null}
        <DropdownMenuItem
          render={
            <NextLink href="/dashboard/settings">
              <IconSettings className="text-muted-foreground" /> Settings
            </NextLink>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onThemeChange}>
          {resolvedTheme === "dark" ? (
            <>
              <IconSun className="text-muted-foreground" /> Light mode
            </>
          ) : (
            <>
              <IconMoon className="text-muted-foreground" /> Dark mode
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>
          <IconLogout className="text-muted-foreground" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
