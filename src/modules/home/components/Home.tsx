import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { MdRemoveRedEye } from 'react-icons/md';
import {
  Container,
  Button,
  ButtonOutline,
  Tabs,
  Tab,
} from '../../../components';
import { StoryItem } from '../';
import { SubsetStory, BlockstackUser } from '../../../types';

export const PageContainer = styled.div`
  ${tw`mt-8`};
`;

export const PageTitleContainer = styled.div`
  ${tw`mb-2 flex justify-between border-b border-solid border-grey pb-8`};
`;

export const PageTitle = styled.div`
  ${tw`text-3xl`};
`;

export const IlluContainer = styled.div`
  ${tw`flex flex-col items-center justify-center mt-8`};
`;

const VisitButton = styled(ButtonOutline)`
  ${tw`mr-6 inline-flex`};
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
        <PageTitle>
          {selectedTab === 'published' ? 'Published stories' : 'Drafts stories'}
        </PageTitle>
        <div>
          <VisitButton
            size="large"
            as="a"
            href={`/${user.username}`}
            target="_blank"
          >
            Visit my blog <MdRemoveRedEye size={18} style={{ marginLeft: 8 }} />
          </VisitButton>
          {!loadingCreate && (
            <Button onClick={onCreateNewPrivateStory}>New story</Button>
          )}
          {loadingCreate && <Button disabled>creating new story ...</Button>}
        </div>
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
