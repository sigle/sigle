'use client';

import type { paths } from '@/__generated__/sigle-api/openapi';
import { env } from '@/env';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { cn } from '@/lib/cn';
import { resolveImageUrl } from '@/lib/images';
import { Routes } from '@/lib/routes';
import {
  Avatar,
  Button,
  Container,
  DropdownMenu,
  IconButton,
} from '@radix-ui/themes';
import { IconDotsVertical, IconPencil } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePostHog } from 'posthog-js/react';

interface ProfileHeaderProps {
  user: paths['/api/users/{username}']['get']['responses']['200']['content']['application/json'];
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const posthog = usePostHog();
  const { copyToClipboard } = useCopyToClipboard();
  const { data: session } = useSession();

  const onCopyLink = () => {
    copyToClipboard(
      `${env.NEXT_PUBLIC_APP_URL}${Routes.userProfile({ username: user.id })}`,
    );
    posthog.capture('profile_link_copied', {
      profileId: user.id,
    });
  };

  const isCurrentUser = session?.user.id === user.id;
  const hasBanner = user?.profile?.coverPictureUri;

  return (
    <>
      <div
        className={cn('relative w-full  bg-gray-3', {
          'h-64 md:h-[22rem]': hasBanner,
          'h-32': !hasBanner,
        })}
      >
        {/* TODO use next.js image component with blurhash */}
        {hasBanner ? (
          <img
            className="size-full object-cover"
            src={
              user.profile?.coverPictureUri
                ? resolveImageUrl(user.profile.coverPictureUri)
                : undefined
            }
            alt="Banner"
            sizes="100vw"
          />
        ) : null}
      </div>

      <Container size="2" px="4">
        <div className="flex justify-between">
          <div className="z-10 mt-[-70px] rounded-5 border-[6px] border-white bg-white dark:border-gray-1">
            {/* TODO use next.js image component with blurhash */}
            <Avatar
              src={
                user.profile?.pictureUri
                  ? resolveImageUrl(user.profile.pictureUri)
                  : undefined
              }
              fallback={user.id[0]}
              alt={user.id}
              size="8"
              radius="small"
            />
          </div>

          <div className="mt-4 flex items-center gap-4">
            {isCurrentUser ? (
              <Button color="gray" variant="soft" asChild>
                <Link href="/dashboard/settings">
                  Edit profile <IconPencil size={16} />
                </Link>
              </Button>
            ) : null}

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton variant="ghost" color="gray" size="2">
                  <IconDotsVertical size={16} />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                align="end"
                variant="soft"
                color="gray"
                highContrast
              >
                <DropdownMenu.Item onClick={onCopyLink}>
                  Copy link to profile
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </Container>
    </>
  );
};
