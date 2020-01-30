import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { StoryItem } from '../';
import { SubsetStory, BlockstackUser } from '../../../types';
import {
  DashboardPageContainer,
  DashboardLayout,
} from '../../layout/components/DashboardLayout';
import { DashboardPageTitle } from '../../layout/components/DashboardHeader';

export const IlluContainer = styled.div`
  ${tw`flex flex-col items-center justify-center mt-8`};
`;

const Illu = styled.img`
  ${tw`mb-4`};
  width: 250px;
  max-width: 100%;
`;

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

  return (
    <DashboardLayout>
      <DashboardPageContainer>
        <DashboardPageTitle
          title={
            selectedTab === 'published' ? 'Published stories' : 'Drafts stories'
          }
        />

        {showIllu && (
          <IlluContainer>
            <Illu src="/static/img/three.png" alt="Three" />
            <p>Shoot the "new story" button to start.</p>
          </IlluContainer>
        )}

        {stories &&
          stories.map(story => (
            <StoryItem
              key={story.id}
              user={user}
              story={story}
              type={selectedTab === 'published' ? 'public' : 'private'}
              refetchStoriesLists={refetchStoriesLists}
            />
          ))}
      </DashboardPageContainer>
    </DashboardLayout>
  );
};
