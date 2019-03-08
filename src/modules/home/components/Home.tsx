import React from 'react';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { Container, Button, Tabs, Tab } from '../../../components';
import { StoryItem } from '../';
import { SubsetStory, BlockstackUser } from '../../../types';
import three from '../../../img/three.png';

export const PageContainer = styled(Container)`
  ${tw`mt-8`};
`;

export const PageTitleContainer = styled.div`
  ${tw`mb-8 flex justify-between`};
`;

export const PageTitle = styled.div`
  ${tw`text-3xl`};
  font-family: 'Libre Baskerville', serif;
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
  onSelectTab: (tab: 'published' | 'drafts') => void;
  user: BlockstackUser;
  loadingCreate: boolean;
  onCreateNewPrivateStory: () => void;
  privateStories: SubsetStory[] | null;
  publicStories: SubsetStory[] | null;
  onPublish: () => void;
  onUnPublish: () => void;
}

export const Home = ({
  selectedTab,
  onSelectTab,
  user,
  loadingCreate,
  onCreateNewPrivateStory,
  privateStories,
  publicStories,
  onPublish,
  onUnPublish,
}: Props) => {
  const showIllu =
    (selectedTab === 'drafts' &&
      (!privateStories || privateStories.length === 0)) ||
    (selectedTab === 'published' &&
      (!publicStories || publicStories.length === 0));

  return (
    <PageContainer>
      <PageTitleContainer>
        <PageTitle>My stories</PageTitle>
        {!loadingCreate && (
          <Button onClick={onCreateNewPrivateStory}>New story</Button>
        )}
        {loadingCreate && <Button disabled>creating new story ...</Button>}
      </PageTitleContainer>

      <Tabs>
        <Tab
          className={selectedTab === 'drafts' ? 'active' : ''}
          onClick={() => onSelectTab('drafts')}
        >
          Drafts ({privateStories ? privateStories.length : '...'})
        </Tab>
        <Tab
          className={selectedTab === 'published' ? 'active' : ''}
          onClick={() => onSelectTab('published')}
        >
          Published ({publicStories ? publicStories.length : '...'})
        </Tab>
      </Tabs>

      {showIllu && (
        <IlluContainer>
          <Illu src={three} alt="Three" />
          <p>Shoot the "new story" button to start.</p>
        </IlluContainer>
      )}

      {selectedTab === 'drafts' &&
        privateStories &&
        privateStories.map(story => (
          <StoryItem
            key={story.id}
            user={user}
            story={story}
            type="private"
            onPublish={onPublish}
            onUnPublish={onUnPublish}
          />
        ))}

      {selectedTab === 'published' &&
        publicStories &&
        publicStories.map(story => (
          <StoryItem
            key={story.id}
            user={user}
            story={story}
            type="public"
            onPublish={onPublish}
            onUnPublish={onUnPublish}
          />
        ))}
    </PageContainer>
  );
};
