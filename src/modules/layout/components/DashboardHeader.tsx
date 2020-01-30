import React, { useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { toast } from 'react-toastify';
import { MdRemoveRedEye, MdSort } from 'react-icons/md';
import * as Fathom from 'fathom-client';
import { useRouter } from 'next/router';
import { ButtonOutline, Button } from '../../../components';
import {
  createNewEmptyStory,
  convertStoryToSubsetStory,
  saveStoriesFile,
  saveStoryFile,
  getStoriesFile,
} from '../../../utils';
import { Goals } from '../../../utils/fathom';
import { userSession } from '../../../utils/blockstack';

export const PageTitleContainer = styled.div`
  ${tw`mb-2 pb-4 lg:pb-8 flex flex-col-reverse lg:flex-row justify-between border-b border-solid border-grey`};
`;

export const PageTitle = styled.div`
  ${tw`mt-6 lg:mt-0 text-3xl`};
`;

const ButtonsContainer = styled.div`
  ${tw`flex items-center justify-between`};
`;

const LogoContainer = styled.div`
  ${tw`flex items-center lg:hidden`};
`;

const MobileMenuButton = styled.button`
  ${tw``};
`;

const Logo = styled.img`
  ${tw`ml-4`};
  height: 35px;
`;

const VisitButton = styled(ButtonOutline)`
  ${tw`mr-6 hidden lg:inline-flex`};
`;

interface DashboardPageTitleProps {
  title?: string;
}

export const DashboardPageTitle = ({ title }: DashboardPageTitleProps) => {
  const router = useRouter();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const user = userSession.loadUserData();

  const handleCreateNewPrivateStory = async () => {
    setLoadingCreate(true);
    try {
      const storiesFile = await getStoriesFile();
      const story = createNewEmptyStory();

      storiesFile.stories.unshift(convertStoryToSubsetStory(story));

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
    <PageTitleContainer>
      <PageTitle>{title}</PageTitle>
      <ButtonsContainer>
        <LogoContainer>
          <MobileMenuButton>
            <MdSort size={32} />
          </MobileMenuButton>
          <Logo src="/img/logo.png" alt="logo" />
        </LogoContainer>
        <VisitButton
          size="large"
          as="a"
          href={`/${user.username}`}
          target="_blank"
        >
          Visit my blog <MdRemoveRedEye size={18} style={{ marginLeft: 8 }} />
        </VisitButton>
        {!loadingCreate && (
          <Button onClick={handleCreateNewPrivateStory}>New story</Button>
        )}
        {loadingCreate && <Button disabled>creating new story ...</Button>}
      </ButtonsContainer>
    </PageTitleContainer>
  );
};
