import {
  EyeOpenIcon as EyeOpenIconBase,
  GitHubLogoIcon,
  TwitterLogoIcon,
  DiscordLogoIcon,
  SunIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify';
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
  Text,
} from '../../../ui';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '../../../utils';
import * as Fathom from 'fathom-client';
import { useAuth } from '../../auth/AuthContext';
import { Goals } from '../../../utils/fathom';
import { sigleConfig } from '../../../config';
import { userSession } from '../../../utils/blockstack';
import posthog from 'posthog-js';
import { isExperimentalThemeToggleEnabled } from '../../../utils/featureFlags';
import { createSubsetStory } from '../../editor/utils';
import { useTheme } from 'next-themes';

const Header = styled('header', Container, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mt: '$4',
  width: '100%',

  '@md': {
    mt: '$10',
  },
});

const StatusDot = styled('div', {
  backgroundColor: '#37C391',
  width: '$2',
  height: '$2',
  borderRadius: '$round',
});

export const AppHeader = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const { username } = router.query as {
    username: string;
  };

  const toggleTheme = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  let src;

  switch (resolvedTheme) {
    case 'light':
      src = '/static/img/logo.png';
      break;
    case 'dark':
      src = '/static/img/logo_white.png';
      break;
    default:
      src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
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
    userSession.signUserOut();
    window.location.reload();
    posthog.reset();
  };

  return (
    <Header>
      <Flex
        css={{ width: '100%', '@md': { width: 'auto' } }}
        justify="between"
        gap="10"
        as="nav"
        align="center"
      >
        <Link href="/[username]" as={`/${username}`} passHref>
          <Flex as="a" css={{ '@lg': { display: 'none' } }}>
            <Image
              width={93}
              height={34}
              objectFit="cover"
              src={src}
              alt="logo"
            />
          </Flex>
        </Link>

        <Link href="/" passHref>
          <Box as="a" css={{ display: 'none', '@lg': { display: 'flex' } }}>
            <Image
              width={93}
              height={34}
              objectFit="cover"
              src={src}
              alt="logo"
            />
          </Box>
        </Link>
      </Flex>
      <Flex
        css={{
          display: 'none',
          '@md': {
            display: 'flex',
          },
        }}
        align="center"
        gap="10"
      >
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Flex
                tabIndex={0}
                css={{
                  cursor: 'pointer',
                  p: '$2',
                  br: '$1',
                  '&:hover': { backgroundColor: '$gray4' },
                  '&:active': { backgroundColor: '$gray5' },
                }}
                gap="1"
                align="center"
              >
                <StatusDot />
                <Text>{user.username}</Text>
              </Flex>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={8}>
              <DropdownMenuItem
                selected={router.pathname === `/${user.username}`}
              >
                <Box
                  css={{ width: '100%' }}
                  as="a"
                  href={`/${user.username}`}
                  target="_blank"
                >
                  My blog
                </Box>
              </DropdownMenuItem>
              <DropdownMenuItem selected={router.pathname === '/'}>
                <Link href="/" passHref>
                  <Box css={{ width: '100%' }} as="a">
                    Dashboard
                  </Box>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem selected={router.pathname === '/settings'}>
                <Link href="/settings" passHref>
                  <Box css={{ width: '100%' }} as="a">
                    Settings
                  </Box>
                </Link>
              </DropdownMenuItem>
              {isExperimentalThemeToggleEnabled && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleTheme}>
                    Switch theme
                    <IconButton css={{ p: 0 }} as="button">
                      <SunIcon />
                    </IconButton>
                  </DropdownMenuItem>
                </>
              )}
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
        {user ? (
          <Button
            disabled={loadingCreate}
            onClick={handleCreateNewPrivateStory}
            size="lg"
          >
            {!loadingCreate ? `Write a story` : `Creating new story...`}
          </Button>
        ) : (
          <Link href="/" passHref>
            <Button as="a" size="lg">
              Enter App
            </Button>
          </Link>
        )}
        {!user && isExperimentalThemeToggleEnabled && (
          <IconButton as="button" onClick={toggleTheme}>
            <SunIcon />
          </IconButton>
        )}
      </Flex>
    </Header>
  );
};
