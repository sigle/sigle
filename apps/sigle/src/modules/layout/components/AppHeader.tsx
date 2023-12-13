import {
  GitHubLogoIcon,
  TwitterLogoIcon,
  DiscordLogoIcon,
  SunIcon,
  HamburgerMenuIcon,
} from '@radix-ui/react-icons';
import { Button, IconButton, Flex } from '@radix-ui/themes';
import Link from 'next/link';
import Image from 'next/legacy/image';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import * as Fathom from 'fathom-client';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useUserControllerGetUserMe } from '@/__generated__/sigle-api';
import { styled } from '../../../stitches.config';
import { Container } from '../../../ui';
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
      <Link href="/">
        <Image width={93} height={34} objectFit="cover" src={src} alt="logo" />
      </Link>

      <Flex className="flex md:hidden" gap="5" align="center">
        <Button
          color="gray"
          highContrast
          disabled={loadingCreate}
          onClick={handleCreateNewPrivateStory}
        >
          {!loadingCreate ? 'Write' : 'Creating...'}
        </Button>
        <IconButton
          size="3"
          variant="ghost"
          color="gray"
          onClick={handleShowMobileHeader}
        >
          <HamburgerMenuIcon />
        </IconButton>

        <MobileHeader
          open={showMobileHeaderDialog}
          onClose={handleCloseMobileHeader}
        />
      </Flex>

      <Flex className="hidden md:flex" align="center" gap="7">
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
          <Flex gap="6" align="center">
            <IconButton size="2" variant="ghost" color="gray" asChild>
              <a href={sigleConfig.twitterUrl} target="_blank" rel="noreferrer">
                <TwitterLogoIcon />
              </a>
            </IconButton>
            <IconButton size="2" variant="ghost" color="gray" asChild>
              <a href={sigleConfig.discordUrl} target="_blank" rel="noreferrer">
                <DiscordLogoIcon />
              </a>
            </IconButton>
            <IconButton size="2" variant="ghost" color="gray" asChild>
              <a href={sigleConfig.githubUrl} target="_blank" rel="noreferrer">
                <GitHubLogoIcon />
              </a>
            </IconButton>
          </Flex>
        )}
        {!user && (
          <>
            <Button size="2" color="gray" highContrast asChild>
              <Link href="/login">Enter App</Link>
            </Button>
            <IconButton
              size="2"
              variant="ghost"
              color="gray"
              onClick={toggleTheme}
            >
              <SunIcon />
            </IconButton>
          </>
        )}
      </Flex>
    </Header>
  );
};
