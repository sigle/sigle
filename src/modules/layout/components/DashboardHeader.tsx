import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { toast } from 'react-toastify';
import { MdRemoveRedEye } from 'react-icons/md';
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
  ${tw`mb-2 flex justify-between border-b border-solid border-grey pb-8`};
`;

export const PageTitle = styled.div`
  ${tw`text-3xl`};
`;

const VisitButton = styled(ButtonOutline)`
  ${tw`mr-6 inline-flex`};
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
          <Button onClick={handleCreateNewPrivateStory}>New story</Button>
        )}
        {loadingCreate && <Button disabled>creating new story ...</Button>}
      </div>
    </PageTitleContainer>
  );
};
