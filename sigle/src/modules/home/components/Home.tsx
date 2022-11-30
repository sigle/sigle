import React, { useState } from 'react';
import { StoryItem } from '../';
import { SubsetStory, BlockstackUser } from '../../../types';
import { DashboardLayout } from '../../layout/components/DashboardLayout';
import Image from 'next/image';
import { styled } from '../../../stitches.config';
import { Box, Button, Flex, Typography } from '../../../ui';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '../../../utils';
import { createSubsetStory } from '../../editor/utils';
import * as Fathom from 'fathom-client';
import { Goals } from '../../../utils/fathom';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { OnboardingChecklist } from './OnboardingChecklist';
import { useFeatureFlags } from '../../../utils/featureFlags';

const ImgWrapper = styled('div', {
  position: 'relative',
  mx: 'auto',
});

const StoryCardSkeleton = () => {
  return (
    <Flex
      css={{
        display: 'none',

        '@lg': {
          display: 'flex',
          gap: '$7',
          p: '$7',
        },
      }}
    >
      <Box
        css={{ width: 180, height: 130, backgroundColor: '$gray2', br: '$1' }}
      />
      <Flex direction="column" justify="between">
        <Flex direction="column" gap="2">
          <Box
            css={{
              width: 350,
              height: 20,
              backgroundColor: '$gray2',
              br: '$1',
            }}
          />
          <Box
            css={{
              width: 150,
              height: 20,
              backgroundColor: '$gray2',
              br: '$1',
            }}
          />
        </Flex>
        <Flex direction="column" gap="2">
          <Box
            css={{
              width: 600,
              height: 20,
              backgroundColor: '$gray2',
              br: '$1',
            }}
          />
          <Box
            css={{
              width: 500,
              height: 20,
              backgroundColor: '$gray2',
              br: '$1',
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

interface Props {
  selectedTab: 'published' | 'drafts';
  user: BlockstackUser;
  stories: SubsetStory[] | null;
  loading: boolean;
  refetchStoriesLists: () => Promise<void>;
}

export const Home = ({
  selectedTab,
  user,
  stories,
  loading,
  refetchStoriesLists,
}: Props) => {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const router = useRouter();
  const { isExperimentalOnboardingEnabled } = useFeatureFlags();

  const showIllu = !loading && (!stories || stories.length === 0);
  const nbStoriesLabel = loading ? '...' : stories ? stories.length : 0;

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
        <>
          {isExperimentalOnboardingEnabled && <OnboardingChecklist />}
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
        </>
      )}

      {stories &&
        stories.map((story) => (
          <StoryItem
            key={story.id}
            user={user}
            story={story}
            type={selectedTab === 'published' ? 'public' : 'private'}
            refetchStoriesLists={refetchStoriesLists}
          />
        ))}
    </DashboardLayout>
  );
};
