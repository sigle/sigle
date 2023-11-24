import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import * as Fathom from 'fathom-client';
import { signOut } from 'next-auth/react';
import {
  ArchiveIcon,
  CrumpledPaperIcon,
  FileTextIcon,
  MixIcon,
} from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { useSubscriptionControllerGetUserMe } from '@/__generated__/sigle-api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
  Box,
  Typography,
  StyledChevron,
  Flex,
} from '../../../ui';
import { generateAvatar } from '../../../utils/boringAvatar';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '../../../utils';
import { useGetUserSettings } from '../../../hooks/appData';
import { Goals } from '../../../utils/fathom';
import { userSession } from '../../../utils/blockstack';
import { createSubsetStory } from '../../editor/utils';
import { styled } from '../../../stitches.config';
import { useAuth } from '../../auth/AuthContext';
import { Switch, SwitchThumb } from '../../../ui/Switch';

const ImageContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  width: 24,
  height: 24,
  br: '$1',
});

export const HeaderDropdown = () => {
  const { data: settings } = useGetUserSettings();
  const router = useRouter();
  const { user, isLegacy } = useAuth();
  const queryClient = useQueryClient();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { data: userSubscription } = useSubscriptionControllerGetUserMe(
    {},
    {
      enabled: !isLegacy,
    },
  );

  const handleCreateNewPrivateStory = async () => {
    setLoadingCreate(true);
    try {
      const storiesFile = await getStoriesFile();
      const story = createNewEmptyStory();

      storiesFile.stories.unshift(
        createSubsetStory(story, { plainContent: '' }),
      );

      await saveStoriesFile(storiesFile);
      await saveStoryFile(story);

      Fathom.trackGoal(Goals.CREATE_NEW_STORY, 0);
      router.push('/stories/[storyId]', `/stories/${story.id}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setLoadingCreate(false);
    }
  };

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          css={{ display: 'flex', gap: '$2', alignItems: 'center' }}
          size="lg"
          variant="ghost"
        >
          <ImageContainer>
            <Box
              as="img"
              src={
                settings?.siteLogo
                  ? settings.siteLogo
                  : generateAvatar(userAddress)
              }
              css={{
                width: 'auto',
                height: '100%',
                maxWidth: 24,
                maxHeight: 24,
                objectFit: 'cover',
              }}
            />
          </ImageContainer>
          <Typography size="subheading">
            {settings?.siteName ? settings.siteName : user?.username}
          </Typography>
          <StyledChevron css={{ color: '$gray11' }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={8}>
        <Link href={`/${user?.username}`} passHref legacyBehavior>
          <DropdownMenuItem
            css={{ py: '$1', px: '$2' }}
            selected={router.pathname === user?.username}
            as="a"
          >
            <ImageContainer
              css={{
                width: 38,
                height: 38,
              }}
            >
              <Box
                as="img"
                src={
                  settings?.siteLogo
                    ? settings.siteLogo
                    : generateAvatar(userAddress)
                }
                css={{
                  width: 'auto',
                  height: '100%',
                  maxWidth: 38,
                  maxHeight: 38,
                  objectFit: 'cover',
                }}
              />
            </ImageContainer>
            <Flex direction="column" align="start" justify="center">
              {settings?.siteName && (
                <Typography size="subheading" css={{ color: '$gray11' }}>
                  {settings.siteName}
                </Typography>
              )}
              <Typography size="subparagraph" css={{ color: '$gray9' }}>
                {user?.username}
              </Typography>
            </Flex>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          css={{ color: '$gray11' }}
          disabled={loadingCreate}
          onClick={handleCreateNewPrivateStory}
          onSelect={(e) => e.preventDefault()}
        >
          <FileTextIcon />
          {!loadingCreate ? `Write a story` : `Creating new story...`}
        </DropdownMenuItem>
        {upperNavItems.map((item) => (
          <Link key={item.path} href={item.path} passHref legacyBehavior>
            <DropdownMenuItem
              css={{ color: '$gray11' }}
              selected={router.pathname === item.path}
              as="a"
            >
              {item.icon}
              {item.name}
            </DropdownMenuItem>
          </Link>
        ))}
        <DropdownMenuSeparator />
        {lowerNavItems.map((item) => (
          <Link key={item.path} href={item.path} passHref legacyBehavior>
            <DropdownMenuItem selected={router.pathname === item.path} as="a">
              {item.name}
            </DropdownMenuItem>
          </Link>
        ))}
        <DropdownMenuItem
          css={{ minWidth: 231, justifyContent: 'space-between', pr: '$2' }}
          onSelect={(e) => e.preventDefault()}
          onClick={toggleTheme}
        >
          Dark mode
          <Switch checked={resolvedTheme === 'dark'}>
            <SwitchThumb />
          </Switch>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
