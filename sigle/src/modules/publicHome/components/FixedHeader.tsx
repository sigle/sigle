import { styled } from '../../../stitches.config';
import {
  Box,
  Button,
  Container,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Flex,
  IconButton,
  StyledChevron,
  Typography,
} from '../../../ui';
import { userSession } from '../../../utils/blockstack';
import { createSubsetStory } from '../../editor/utils';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '../../../utils';
import {
  useGetUserFollowing,
  useGetUserSettings,
  useUserFollow,
  useUserUnfollow,
} from '../../../hooks/appData';
import { useFeatureFlags } from '../../../utils/featureFlags';
import { useAuth } from '../../auth/AuthContext';
import { useQueryClient } from 'react-query';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Goals } from '../../../utils/fathom';
import {
  GitHubLogoIcon,
  TwitterLogoIcon,
  DiscordLogoIcon,
  SunIcon,
} from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { toast } from 'react-toastify';
import * as Fathom from 'fathom-client';
import { generateAvatar } from '../../../utils/boringAvatar';
import { sigleConfig } from '../../../config';
import { SettingsFile } from '../../../types';

const Header = styled('header', Container, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mt: '$4',
  width: '100%',
  boxShadow: '0 1px 0 0 $colors$gray6',

  '@md': {
    mt: '$10',
  },
});

const ImageContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  width: 24,
  height: 24,
  br: '$1',
});

interface FixedHeaderProps {
  userInfo: { username: string; address: string };
  settings: SettingsFile;
  isScrolled: boolean;
}

export const FixedHeader = ({
  userInfo,
  settings,
  isScrolled,
}: FixedHeaderProps) => {
  const { data: userSettings } = useGetUserSettings();
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isExperimentalFollowEnabled } = useFeatureFlags();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const { data: userFollowing } = useGetUserFollowing({
    enabled: !!user && userInfo.username !== user.username,
  });
  const { mutate: followUser } = useUserFollow();
  const { mutate: unfollowUser } = useUserUnfollow();

  const handleFollow = async () => {
    if (!userFollowing) return;
    followUser({ userFollowing, address: userInfo.address });
  };

  const handleUnfollow = async () => {
    if (!userFollowing) {
      return;
    }
    unfollowUser({ userFollowing, address: userInfo.address });
  };

  const toggleTheme = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  let src;

  switch (resolvedTheme) {
    case 'dark':
      src = '/static/img/logo_white.png';
      break;
    default:
      src = '/static/img/logo.png';
      break;
  }

  const handleCreateNewPrivateStory = async () => {
    setLoadingCreate(true);
    try {
      const storiesFile = await getStoriesFile();
      const story = createNewEmptyStory();

      storiesFile.stories.unshift(
        createSubsetStory(story, { plainContent: '' })
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

  const userAddress =
    user?.profile.stxAddress.mainnet || user?.profile.stxAddress;

  const isFollowingUser =
    userFollowing && !!userFollowing.following[userInfo.address];

  return (
    <Header
      css={{
        backgroundColor: '$gray1',
        position: isScrolled ? 'sticky' : 'relative',
        top: isScrolled ? 0 : 'auto',
        zIndex: 1,
        py: '$2',
      }}
    >
      {isExperimentalFollowEnabled &&
      user &&
      user.username !== userInfo.username ? (
        <Flex
          css={{
            alignItems: 'center',
            gap: '$5',
          }}
        >
          <ImageContainer
            css={{
              width: 44,
              height: 44,
              br: '$3',
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
                maxWidth: 44,
                maxHeight: 44,
                objectFit: 'cover',
              }}
            />
          </ImageContainer>
          {userFollowing ? (
            !isFollowingUser ? (
              <Button color="orange" onClick={handleFollow}>
                Follow
              </Button>
            ) : (
              <Button variant="subtle" onClick={handleUnfollow}>
                Unfollow
              </Button>
            )
          ) : null}
        </Flex>
      ) : (
        <Box />
      )}
      <Flex
        css={{
          display: 'none',
          '@md': {
            display: 'flex',
          },
        }}
        align="center"
        gap="9"
      >
        {user ? (
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
                      userSettings?.siteLogo
                        ? userSettings.siteLogo
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
                  {settings?.siteName ? settings.siteName : user.username}
                </Typography>
                <StyledChevron css={{ color: '$gray11' }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={8}>
              <Button
                disabled={loadingCreate}
                onClick={handleCreateNewPrivateStory}
                size="lg"
              >
                {!loadingCreate ? `Write a story` : `Creating new story...`}
              </Button>
              <DropdownMenuItem
                selected={router.pathname === `/${user.username}`}
                as="a"
                href={`/${user.username}`}
                target="_blank"
              >
                My blog
              </DropdownMenuItem>
              <Link href="/" passHref>
                <DropdownMenuItem selected={router.pathname === '/'} as="a">
                  Dashboard
                </DropdownMenuItem>
              </Link>
              <Link href="/settings" passHref>
                <DropdownMenuItem
                  selected={router.pathname === '/settings'}
                  as="a"
                >
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                Switch theme
                <IconButton css={{ p: 0 }} as="button">
                  <SunIcon />
                </IconButton>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem color="red" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Flex gap="6">
            <IconButton
              as="a"
              href={sigleConfig.twitterUrl}
              target="_blank"
              rel="noreferrer"
            >
              <TwitterLogoIcon />
            </IconButton>
            <IconButton
              as="a"
              href={sigleConfig.discordUrl}
              target="_blank"
              rel="noreferrer"
            >
              <DiscordLogoIcon />
            </IconButton>
            <IconButton
              as="a"
              href={sigleConfig.githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              <GitHubLogoIcon />
            </IconButton>
          </Flex>
        )}
        {!user && (
          <>
            <Link href="/" passHref>
              <Button as="a" size="lg">
                Enter App
              </Button>
            </Link>
            <IconButton as="button" onClick={toggleTheme}>
              <SunIcon />
            </IconButton>
          </>
        )}
      </Flex>
    </Header>
  );
};
