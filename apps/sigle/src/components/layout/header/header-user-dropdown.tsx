import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { DropdownMenu, Switch, Flex, Button, Text } from '@radix-ui/themes';
import {
  ArchiveIcon,
  CrumpledPaperIcon,
  FileTextIcon,
  MixIcon,
} from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { useSubscriptionControllerGetUserMe } from '@/__generated__/sigle-api';
import { StyledChevron } from '../../../ui';
import { generateAvatar } from '../../../utils/boringAvatar';
import { useGetUserSettings } from '../../../hooks/appData';
import { userSession } from '../../../utils/blockstack';
import { useAuth } from '@/modules/auth/AuthContext';

export const HeaderUserDropdown = () => {
  const { data: settings } = useGetUserSettings();
  const { user, isLegacy } = useAuth();
  const queryClient = useQueryClient();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: userSubscription } = useSubscriptionControllerGetUserMe(
    {},
    {
      enabled: !isLegacy,
    },
  );

  const handleLogout = () => {
    queryClient.removeQueries();
    userSession.signUserOut();
    signOut();
  };

  const toggleTheme = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  const userAddress =
    user?.profile.stxAddress.mainnet || user?.profile.stxAddress;

  const upperNavItems = [
    {
      name: 'Drafts',
      path: '/',
      icon: <CrumpledPaperIcon />,
    },
    {
      name: 'Published',
      path: '/published',
      icon: <ArchiveIcon />,
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: <MixIcon />,
    },
  ];

  const upgradeItem = {
    name: 'Upgrade',
    path: '/settings/plans',
  };

  const lowerNavItems = [
    {
      name: 'Settings',
      path: '/settings',
    },
  ];

  !userSubscription && !isLegacy && lowerNavItems.push(upgradeItem);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button
          className="flex items-center gap-2"
          size="3"
          color="gray"
          variant="ghost"
        >
          <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="avatar"
              src={
                settings?.siteLogo
                  ? settings.siteLogo
                  : generateAvatar(userAddress)
              }
              className="h-full w-auto object-cover"
            />
          </div>
          <Text size="2" color="gray" highContrast>
            {settings?.siteName ? settings.siteName : user?.username}
          </Text>
          <StyledChevron />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        color="gray"
        align="end"
        variant="soft"
        className="min-w-[220px]"
      >
        <DropdownMenu.Item asChild>
          <Link href={`/${user?.username}`} className="justify-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="avatar"
                src={
                  settings?.siteLogo
                    ? settings.siteLogo
                    : generateAvatar(userAddress)
                }
                className="h-full w-auto object-cover"
              />
            </div>
            <Flex direction="column" align="start" justify="center">
              {settings?.siteName && (
                <Text size="2" color="gray" highContrast>
                  {settings.siteName}
                </Text>
              )}
              <Text size="2" color="gray">
                {user?.username}
              </Text>
            </Flex>
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item className="justify-start gap-2" asChild>
          <Link href="/stories/new">
            <FileTextIcon />
            Write a story
          </Link>
        </DropdownMenu.Item>
        {upperNavItems.map((item) => (
          <DropdownMenu.Item key={item.path} asChild>
            <Link href={item.path} className="justify-start gap-2">
              {item.icon}
              {item.name}
            </Link>
          </DropdownMenu.Item>
        ))}
        <DropdownMenu.Separator />
        {lowerNavItems.map((item) => (
          <DropdownMenu.Item key={item.path} color="gray" asChild>
            <Link href={item.path}>{item.name}</Link>
          </DropdownMenu.Item>
        ))}
        <DropdownMenu.Item
          color="gray"
          onSelect={(e) => e.preventDefault()}
          onClick={toggleTheme}
        >
          Dark mode
          <Switch color="orange" checked={resolvedTheme === 'dark'} />
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="gray" onClick={handleLogout}>
          Logout
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
