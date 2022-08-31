import {
  GitHubLogoIcon,
  TwitterLogoIcon,
  DiscordLogoIcon,
  SunIcon,
  HamburgerMenuIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { styled } from '../../../stitches.config';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTrigger,
  Flex,
  IconButton,
  Typography,
} from '../../../ui';
import { useAuth } from '../../auth/AuthContext';
import { sigleConfig } from '../../../config';
import { useGetUserMe } from '../../../hooks/users';
import { HeaderDropdown } from './HeaderDropdown';
import { MobileHeader } from './MobileHeader';
import { useState } from 'react';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '../../../utils';
import { createSubsetStory } from '../../editor/utils';
import * as Fathom from 'fathom-client';
import { Goals } from '../../../utils/fathom';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

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

  /**
   * This query is used to register the user in the DB. As the header is part of all the
   * pages we know this query will run before any operation.
   */
  useGetUserMe({
    enabled: status === 'authenticated',
    staleTime: 0,
    refetchOnMount: false,
  });

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

      <Flex gap="2">
        <Dialog>
          <DialogTrigger>
            <Typography>Trigger</Typography>
          </DialogTrigger>
          <DialogContent>Dialog Content</DialogContent>
        </Dialog>

        <Flex
          css={{
            display: 'flex',
            '@xl': {
              display: 'none',
            },
          }}
          gap="5"
        >
          <Button
            disabled={loadingCreate}
            onClick={handleCreateNewPrivateStory}
          >
            {!loadingCreate ? 'Write' : 'Creating...'}
          </Button>
          <IconButton onClick={handleShowMobileHeader}>
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
          <Link href="/feed" passHref>
            <Button variant="ghost" as="a">
              Feed
            </Button>
          </Link>
        ) : null}
        <Link href="/explore" passHref>
          <Button variant="ghost" as="a">
            Explore
          </Button>
        </Link>
        {user ? (
          <HeaderDropdown />
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
