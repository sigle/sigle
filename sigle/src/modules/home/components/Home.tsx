import React from 'react';
import styledC from 'styled-components';
import tw from 'twin.macro';
import Link from 'next/link';
import { StoryItem } from '../';
import { SubsetStory, BlockstackUser } from '../../../types';
import { DashboardPageTitle } from '../../layout/components/DashboardHeader';
import { sigleConfig } from '../../../config';
import { DashboardLayout } from '../../layout/components/DashboardLayout';
import Image from 'next/image';
import { styled } from '../../../stitches.config';
import { Box, Button, Flex, Text } from '../../../ui';

const ImgWrapper = styled('div', {
  maxWidth: 256,
  position: 'relative',
  mx: 'auto',
});

const StoryCardSkeleton = () => {
  return (
    <Flex
      css={{
        gap: '$7',
        p: '$7',
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
  const showIllu = !loading && (!stories || stories.length === 0);
  const nbStoriesLabel = loading ? '...' : stories ? stories.length : 0;

  return (
    <DashboardLayout>
      <DashboardPageTitle
        title={
          selectedTab === 'published'
            ? `Published stories (${nbStoriesLabel})`
            : `Drafts stories (${nbStoriesLabel})`
        }
      />

      {showIllu && (
        <Flex css={{ mt: '$10' }} align="center" direction="column" gap="5">
          {selectedTab === 'drafts' && (
            <ImgWrapper>
              <Image
                width={256}
                height={94}
                src="/static/img/zero_data.gif"
                objectFit="cover"
              />
            </ImgWrapper>
          )}
          <Text>{`You currently have no ${
            selectedTab === 'published' ? 'published stories' : 'drafts'
          }`}</Text>
          {selectedTab === 'drafts' && <Button size="lg">Write a story</Button>}
          <StoryCardSkeleton />
          <StoryCardSkeleton />
        </Flex>
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
