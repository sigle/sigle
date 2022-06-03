import {
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
import { signOut } from 'next-auth/react';
import { useQueryClient } from 'react-query';
import { useTheme } from 'next-themes';
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
  Typography,
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
import { createSubsetStory } from '../../editor/utils';
import { StyledChevron } from '../../../ui/Accordion';

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
  mr: '$2',
});

export const AppHeader = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loadingCreate, setLoadingCreate] = useState(false);

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

  return (
    <Header>
      <Flex
        css={{ width: '100%', '@md': { width: 'auto' } }}
        justify="between"
        gap="10"
        as="nav"
        align="center"
      >
        <Link href="/[username]" as={`/`} passHref>
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
              <Button
                css={{ display: 'flex', gap: '$2' }}
                size="lg"
                variant="ghost"
              >
                <StatusDot />
                <Typography size="subheading">{user.username}</Typography>
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
