import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Container, Button, Tabs, Tab } from '../../../components';
import { StoryItem } from '../';
import { SubsetStory, BlockstackUser } from '../../../types';

export const PageContainer = styled.div`
  ${tw`mt-8`};
`;

export const PageTitleContainer = styled.div`
  ${tw`mb-8 flex justify-between`};
`;

export const PageTitle = styled.div`
  ${tw`text-3xl`};
`;

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
  loadingCreate: boolean;
  onCreateNewPrivateStory: () => void;
  stories: SubsetStory[] | null;
  refetchStoriesLists: () => Promise<void>;
}

export const Home = ({
  selectedTab,
  user,
  loadingCreate,
  onCreateNewPrivateStory,
  stories,
  refetchStoriesLists,
}: Props) => {
  const showIllu = !stories || stories.length === 0;

  return (
    <PageContainer>
      <PageTitleContainer>
        <PageTitle>My stories</PageTitle>
        {!loadingCreate && (
          <Button onClick={onCreateNewPrivateStory}>New story</Button>
        )}
        {loadingCreate && <Button disabled>creating new story ...</Button>}
      </PageTitleContainer>

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
    </PageContainer>
  );
};
