import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Button, IconButton } from '@radix-ui/themes';
import { useState } from 'react';
import * as Fathom from 'fathom-client';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { Goals } from '@/utils/fathom';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '@/utils';
import { createSubsetStory } from '@/modules/editor/utils';
import { MobileDrawer } from '../mobile-drawer';

export const HeaderMobile = () => {
  const router = useRouter();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [showMobileHeaderDialog, setShowMobileHeaderDialog] = useState(false);

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

  return (
    <>
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
        onClick={() => setShowMobileHeaderDialog(true)}
      >
        <HamburgerMenuIcon />
      </IconButton>

      <MobileDrawer
        open={showMobileHeaderDialog}
        onOpenChange={(open) => setShowMobileHeaderDialog(open)}
      />
    </>
  );
};
