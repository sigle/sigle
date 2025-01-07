'use client';

import { useStacksLogin } from '@/hooks/useStacksLogin';
import { Avatar, DropdownMenu, IconButton } from '@radix-ui/themes';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { usePostHog } from 'posthog-js/react';
import NextLink from 'next/link';
import { Routes } from '@/lib/routes';
import { sigleApiClient } from '@/__generated__/sigle-api';
import { resolveImageUrl } from '@/lib/images';

export const UserDropdown = () => {
  const posthog = usePostHog();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();
  const { logout } = useStacksLogin();

  const { data: user } = sigleApiClient.useSuspenseQuery(
    'get',
    '/api/users/{username}',
    {
      params: {
        path: {
          username: session?.user.id || '',
        },
      },
    },
  );

  const onThemeChange = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    posthog.capture('theme_change', { theme: newTheme });
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
          {/* TODO use next.js image component with blurhash */}
          <Avatar
            src={
              user.profile?.pictureUri
                ? resolveImageUrl(user.profile.pictureUri)
                : undefined
            }
            fallback={session.user?.id?.[0] || ''}
            alt={`${user.profile?.displayName}`}
            size="2"
          />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" color="gray" variant="soft">
        {whitelisted ? (
          <>
            <DropdownMenu.Item asChild>
              <NextLink href={'/p/new'}>Write a story</NextLink>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <NextLink href={'/dashboard/settings'}>Settings</NextLink>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <NextLink
                href={Routes.userProfile({
                  username: session.user.id,
                })}
              >
                Profile
              </NextLink>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
          </>
        ) : null}
        <DropdownMenu.Item onClick={onThemeChange}>
          {resolvedTheme === 'dark' ? 'Light' : 'Dark'} theme
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={logout}>Log out</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
