import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Button, IconButton, Flex } from '@radix-ui/themes';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import * as Fathom from 'fathom-client';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { useUserControllerGetUserMe } from '@/__generated__/sigle-api';
import { HeaderLogo } from '@/components/layout/header/header-logo';
import { HeaderLoggedOut } from '@/components/layout/header/header-logged-out';
import { HeaderLoggedIn } from '@/components/layout/header/header-logged-in';
import { styled } from '../../../stitches.config';
import { Container } from '../../../ui';
import { useAuth } from '../../auth/AuthContext';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '../../../utils';
import { createSubsetStory } from '../../editor/utils';
import { Goals } from '../../../utils/fathom';
import { MobileDrawer } from '@/components/layout/mobile-drawer';

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
  const { user } = useAuth();
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

  const handleShowMobileHeader = () => setShowMobileHeaderDialog(true);

  const handleCloseMobileHeader = (open: boolean) =>
    setShowMobileHeaderDialog(open);

  return (
    <Header>
      <HeaderLogo />

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

        <MobileDrawer
          open={showMobileHeaderDialog}
          onOpenChange={handleCloseMobileHeader}
        />
      </Flex>

      <Flex className="hidden md:flex" align="center" gap="7">
        {!user ? <HeaderLoggedOut /> : <HeaderLoggedIn />}
      </Flex>
    </Header>
  );
};
