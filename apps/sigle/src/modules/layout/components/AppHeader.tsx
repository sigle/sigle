import {
  GitHubLogoIcon,
  TwitterLogoIcon,
  DiscordLogoIcon,
  SunIcon,
  HamburgerMenuIcon,
} from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import Link from 'next/link';
import Image from 'next/legacy/image';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import * as Fathom from 'fathom-client';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useUserControllerGetUserMe } from '@/__generated__/sigle-api';
import { cn } from '@/lib/cn';
import { styled } from '../../../stitches.config';
import {
  Box,
  Button as UiButton,
  Container,
  Flex,
  IconButton,
} from '../../../ui';
import { useAuth } from '../../auth/AuthContext';
import { sigleConfig } from '../../../config';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '../../../utils';
import { createSubsetStory } from '../../editor/utils';
import { Goals } from '../../../utils/fathom';
import { MobileHeader } from './MobileHeader';
import { HeaderDropdown } from './HeaderDropdown';

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

export const AppHeader = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isLegacy } = useAuth();
  const { status } = useSession();
  const [showMobileHeaderDialog, setShowMobileHeaderDialog] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const router = useRouter();

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

  /**
   * This query is used to register the user in the DB. As the header is part of all the
   * pages we know this query will run before any operation.
   */
  useUserControllerGetUserMe(
    {},
    {
      enabled: status === 'authenticated',
      staleTime: 0,
      refetchOnMount: false,
    },
  );

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

  const handleShowMobileHeader = () => setShowMobileHeaderDialog(true);

  const handleCloseMobileHeader = () => setShowMobileHeaderDialog(false);

  return (
    <Header>
      <Link href="/" passHref legacyBehavior>
        <Box as="a">
          <Image
            width={93}
            height={34}
            objectFit="cover"
            src={src}
            alt="logo"
          />
        </Box>
      </Link>

      <Flex gap="2">
        <Flex
          css={{
            display: 'flex',
            '@md': {
              display: 'none',
            },
          }}
          gap="5"
        >
          <UiButton
            disabled={loadingCreate}
            onClick={handleCreateNewPrivateStory}
          >
            {!loadingCreate ? 'Write' : 'Creating...'}
          </UiButton>
          <IconButton
            css={{
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
            onClick={handleShowMobileHeader}
          >
            <HamburgerMenuIcon />
          </IconButton>

          <MobileHeader
            open={showMobileHeaderDialog}
            onClose={handleCloseMobileHeader}
          />
        </Flex>
      </Flex>

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
        {user && !isLegacy ? (
          <Button size="2" variant="ghost" color="gray" highContrast asChild>
            <Link href="/feed">Feed</Link>
          </Button>
        ) : null}
        <Button size="2" variant="ghost" color="gray" highContrast asChild>
          <Link href="/explore">Explore</Link>
        </Button>
        {user ? (
          <HeaderDropdown />
        ) : (
          <Flex gap="6">
            <IconButton
              size="sm"
              as="a"
              href={sigleConfig.twitterUrl}
              target="_blank"
              rel="noreferrer"
            >
              <TwitterLogoIcon />
            </IconButton>
            <IconButton
              size="sm"
              as="a"
              href={sigleConfig.discordUrl}
              target="_blank"
              rel="noreferrer"
            >
              <DiscordLogoIcon />
            </IconButton>
            <IconButton
              size="sm"
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
            <Link href="/" passHref legacyBehavior>
              <UiButton as="a" size="lg">
                Enter App
              </UiButton>
            </Link>
            <IconButton size="sm" as="button" onClick={toggleTheme}>
              <SunIcon />
            </IconButton>
          </>
        )}
      </Flex>
    </Header>
  );
};
