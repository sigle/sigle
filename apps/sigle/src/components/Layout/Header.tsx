"use client";

import { useIsClient } from "@/hooks/useIsClient";
import { useStacksLogin } from "@/hooks/useStacksLogin";
import { LogoImage } from "@/images/Logo";
import { useSession } from "@/lib/auth-client";
import { Button, IconButton } from "@radix-ui/themes";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Suspense, useLayoutEffect } from "react";
import { NextLink } from "../Shared/NextLink";
import { UserDropdown } from "./UserDropdown";

export const Header = () => {
  const posthog = usePostHog();
  const pathname = usePathname();
  const isClient = useIsClient();
  const { login } = useStacksLogin();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();

  // Next.js has a problem with the scroll position when changing pages
  // https://github.com/vercel/next.js/issues/49427
  useLayoutEffect(() => {
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  const onThemeChange = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    posthog.capture("theme_change", { theme: newTheme });
  };

  return (
    <header className="sticky top-0 z-20 flex h-[--header-height] items-center justify-between border-b border-gray-6 bg-[var(--color-background)] px-4 md:px-[60px]">
      <NextLink href="/">
        <LogoImage height={28} />
      </NextLink>
      {!session ? (
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            color="gray"
            highContrast
            // disabled={loadingSession}
            onClick={login}
          >
            Write on Sigle
          </Button>
          <Button
            color="gray"
            highContrast
            // disabled={loadingSession}
            onClick={login}
          >
            Sign In
          </Button>
          <IconButton
            variant="ghost"
            color="gray"
            highContrast
            onClick={onThemeChange}
          >
            {/* To avoid hydratation issues we always render the sun icon on the server */}
            {!isClient || resolvedTheme === "light" ? (
              <IconSun size={16} />
            ) : (
              <IconMoon size={16} />
            )}
          </IconButton>
        </div>
      ) : null}
      {session ? (
        <div className="flex items-center gap-5">
          <Button color="gray" highContrast asChild>
            <NextLink href="/dashboard">Dashboard</NextLink>
          </Button>
          <Suspense fallback={null}>
            <UserDropdown />
          </Suspense>
        </div>
      ) : null}
    </header>
  );
};
