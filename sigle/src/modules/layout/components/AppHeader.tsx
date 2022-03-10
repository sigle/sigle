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
import { Box, Button, Container, Flex, IconButton, Text } from '../../../ui';
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
import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../ui/HoverCard';
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

const EyeOpenIcon = styled(EyeOpenIconBase, {
  display: 'inline-block',
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
      <Flex justify="center" gap="10" as="nav" align="center">
        <Link href="/[username]" as={`/${username}`} passHref>
          <Flex as="a" css={{ '@lg': { display: 'none' } }}>
            <Image
              priority
              width={101}
              height={45}
              objectFit="cover"
              src={`/static/img/${
                resolvedTheme === 'dark' ? 'logo_white.png' : 'logo.png'
              }`}
              alt="logo"
            />
          </Flex>
        </Link>
        <Link href="/" passHref>
          <Box as="a" css={{ display: 'none', '@lg': { display: 'flex' } }}>
            <Image
              priority
              width={101}
              height={45}
              objectFit="cover"
              src={`/static/img/${
                resolvedTheme === 'dark' ? 'logo_white.png' : 'logo.png'
              }`}
              alt="logo"
            />
          </Box>
        </Link>
        {user && (
          <Button
            css={{
              display: 'none',
              '@xl': {
                display: 'block',
              },
            }}
            variant="ghost"
            href={`/${user.username}`}
            target="_blank"
            as="a"
          >
            <Text size="action" css={{ mr: '$2', display: 'inline-block' }}>
              Visit my blog
            </Text>
            <EyeOpenIcon />
          </Button>
        )}
      </Flex>
      <Flex
        css={{
          display: 'none',
          '@xl': {
            display: 'flex',
          },
        }}
        align="center"
        gap="10"
      >
        {user ? (
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Flex
                tabIndex={0}
                css={{ cursor: 'pointer' }}
                gap="1"
                align="center"
              >
                <StatusDot />
                <Text>{user.username}</Text>
              </Flex>
            </HoverCardTrigger>
            <HoverCardContent onClick={handleLogout} sideOffset={16}>
              logout
              <HoverCardArrow />
            </HoverCardContent>
          </HoverCard>
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
              href={sigleConfig.twitterUrl}
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
        {isExperimentalThemeToggleEnabled && (
          <IconButton as="button" onClick={toggleTheme}>
            <SunIcon />
          </IconButton>
        )}
      </Flex>
    </Header>
  );
};
