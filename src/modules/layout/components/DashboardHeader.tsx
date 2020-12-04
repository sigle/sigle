import React, { useState } from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { toast } from 'react-toastify';
import { MdRemoveRedEye, MdSort } from 'react-icons/md';
import * as Fathom from 'fathom-client';
import { useRouter } from 'next/router';
import { DialogContent, DialogOverlay } from '@reach/dialog';
import { animated, useTransition } from 'react-spring';
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
import { DashboardSidebar } from './DashboardLayout';

export const PageTitleContainer = styled.div`
  ${tw`mb-2 pb-4 lg:pb-8 flex flex-col-reverse lg:flex-row justify-between border-b border-solid border-grey`};
`;

export const PageTitle = styled.div`
  ${tw`mt-6 lg:mt-0 text-xl font-bold flex items-center`};
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
  ${tw`mr-6 hidden inline-flex items-center`};
`;

/**
 * Mobile menu
 */

const StyledDialogContent = styled(DialogContent)`
  ${tw`fixed top-0 left-0 bottom-0 overflow-y-auto w-64 m-0 p-0 bg-grey-light`};
`;

interface DashboardPageTitleProps {
  title?: string;
}

const AnimatedDialogOverlay = animated(DialogOverlay);
const AnimatedDialogContent = animated(StyledDialogContent);

export const DashboardPageTitle = ({ title }: DashboardPageTitleProps) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const user = userSession.loadUserData();

  const transitions = useTransition(mobileMenuOpen, null, {
    from: { opacity: 0, transform: 'translateX(-100%)' },
    enter: { opacity: 1, transform: 'translateX(0)' },
    leave: { opacity: 0, transform: 'translateX(-100%)' },
    config: {
      duration: 150,
    },
  });

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

  const handleCloseMobileMenu = () => setMobileMenuOpen(false);

  return (
    <React.Fragment>
      {transitions.map(
        ({ item, key, props: styles }) =>
          item && (
            <AnimatedDialogOverlay
              key={key}
              style={{ opacity: styles.opacity }}
              onDismiss={handleCloseMobileMenu}
              as="div"
            >
              <AnimatedDialogContent
                style={{
                  transform: styles.transform,
                }}
                aria-label="Mobile menu"
              >
                <DashboardSidebar />
              </AnimatedDialogContent>
            </AnimatedDialogOverlay>
          )
      )}

      <PageTitleContainer>
        <PageTitle>{title}</PageTitle>
        <ButtonsContainer>
          <LogoContainer>
            <MobileMenuButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
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
    </React.Fragment>
  );
};
