import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
  Box,
  Typography,
  IconButton,
  StyledChevron,
} from '../../../ui';
import { generateAvatar } from '../../../utils/boringAvatar';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '../../../utils';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from 'react-query';
import { useGetUserSettings } from '../../../hooks/appData';
import * as Fathom from 'fathom-client';
import { Goals } from '../../../utils/fathom';
import { userSession } from '../../../utils/blockstack';
import { createSubsetStory } from '../../editor/utils';
import { styled } from '../../../stitches.config';
import { useAuth } from '../../auth/AuthContext';
import { signOut } from 'next-auth/react';
import { SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

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

  const toggleTheme = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  const userAddress =
    user?.profile.stxAddress.mainnet || user?.profile.stxAddress;

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
        <Button
          disabled={loadingCreate}
          onClick={handleCreateNewPrivateStory}
          size="lg"
        >
          {!loadingCreate ? `Write a story` : `Creating new story...`}
        </Button>
        <DropdownMenuItem
          selected={router.pathname === `/${user?.username}`}
          as="a"
          href={`/${user?.username}`}
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
          <DropdownMenuItem selected={router.pathname === '/settings'} as="a">
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
  );
};
