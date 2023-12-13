import React, { useState } from 'react';
import Image from 'next/legacy/image';
import { useInView } from 'react-cool-inview';
import * as Fathom from 'fathom-client';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { StoryItem } from '../';
import { SubsetStory, BlockstackUser } from '../../../types';
import { DashboardLayout } from '../../layout/components/DashboardLayout';
import { styled } from '../../../stitches.config';
import { Button, Flex, Typography } from '../../../ui';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '../../../utils';
import { createSubsetStory } from '../../editor/utils';
import { Goals } from '../../../utils/fathom';
import { StoryCardSkeleton } from './StoryItemSkeleton';

const ImgWrapper = styled('div', {
  position: 'relative',
  mx: 'auto',
});

interface Props {
  selectedTab: 'published' | 'drafts';
  user: BlockstackUser;
  stories: SubsetStory[] | null;
  loading: boolean;
  refetchStoriesLists: () => Promise<void>;
}

/**
 * Render the home page with the list of stories.
 * We use an infinite loading system to not show all the stories at the same time.
 * Gaia rate limit is pretty strict, we don't want to make 200 calls at the same time
 * to fetch the preview images for example.
 */
export const Home = ({
  selectedTab,
  user,
  stories,
  loading,
  refetchStoriesLists,
}: Props) => {
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const router = useRouter();

  const { observe } = useInView({
    // For better UX, we can grow the root margin so the data will be loaded earlier
    rootMargin: '50px 0px',
    onEnter: async ({}) => {
      setCurrentPage((prev) => prev + 1);
    },
  });

  const showIllu = !loading && (!stories || stories.length === 0);
  const nbStoriesLabel = loading ? '...' : stories ? stories.length : 0;

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

  // Create the subset of stories to display based on the current page
  const storiesToDisplay = stories
    ? stories.slice(0, (currentPage - 1) * itemsPerPage + itemsPerPage)
    : [];

  return (
    <DashboardLayout>
      <Typography
        size="h4"
        css={{
          fontWeight: 600,
          pb: '$5',
          mb: '$2',
          borderBottom: '1px solid $colors$gray6',
        }}
      >
        {selectedTab === 'published'
          ? `Published stories (${nbStoriesLabel})`
          : `Drafts stories (${nbStoriesLabel})`}
      </Typography>

      {showIllu && (
        <Flex css={{ mt: '$10' }} align="center" direction="column">
          {selectedTab === 'drafts' && (
            <ImgWrapper>
              <Image
                width={250}
                height={94}
                src="/static/img/zero_data.gif"
                objectFit="cover"
              />
            </ImgWrapper>
          )}
          <Typography
            size="subheading"
            css={{ mt: '$5', mb: '$3' }}
          >{`You currently have no ${
            selectedTab === 'published' ? 'published stories' : 'drafts'
          }`}</Typography>
          {selectedTab === 'drafts' && (
            <Button
              size="sm"
              variant="subtle"
              disabled={loadingCreate}
              onClick={handleCreateNewPrivateStory}
            >
              {!loadingCreate ? `Start writing` : `Creating new story...`}
            </Button>
          )}
          <StoryCardSkeleton />
          <StoryCardSkeleton />
        </Flex>
      )}

      {storiesToDisplay?.map((story) => (
        <StoryItem
          key={story.id}
          user={user}
          story={story}
          type={selectedTab === 'published' ? 'public' : 'private'}
          refetchStoriesLists={refetchStoriesLists}
        />
      ))}
      <div ref={observe} />
    </DashboardLayout>
  );
};
