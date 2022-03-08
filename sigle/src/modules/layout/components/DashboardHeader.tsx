import React, { useState } from 'react';
import styledC from 'styled-components';
import tw from 'twin.macro';
import { toast } from 'react-toastify';
import { MdRemoveRedEye, MdSort } from 'react-icons/md';
import * as Fathom from 'fathom-client';
import { useRouter } from 'next/router';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ButtonOutline, Button } from '../../../components';
import { Dialog } from '../../../ui';
import { keyframes, styled } from '../../../stitches.config';
import {
  createNewEmptyStory,
  saveStoriesFile,
  saveStoryFile,
  getStoriesFile,
} from '../../../utils';
import { Goals } from '../../../utils/fathom';
import { DashboardSidebar } from './DashboardLayout';
import { useAuth } from '../../auth/AuthContext';
import { createSubsetStory } from '../../editor/utils';

export const PageTitleContainer = styledC.div`
  ${tw`mb-2 pb-4 lg:pb-8 flex flex-col-reverse lg:flex-row justify-between border-b border-solid border-grey`};
`;

export const PageTitle = styledC.div`
  ${tw`mt-6 lg:mt-0 text-xl font-bold flex items-center`};
`;

const ButtonsContainer = styledC.div`
  ${tw`flex items-center justify-between`};
`;

const LogoContainer = styledC.div`
  ${tw`flex items-center lg:hidden`};
`;

const MobileMenuButton = styledC.button`
  ${tw``};
`;

const Logo = styledC.img`
  ${tw`ml-4`};
  height: 35px;
`;

const VisitButton = styledC(ButtonOutline)`
  ${tw`mr-6 hidden inline-flex items-center`};
`;

/**
 * Mobile menu
 */

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-100%)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const StyledDialogContent = styled(DialogPrimitive.Content, {
  transform: 'translateX(0)',
  maxWidth: 'initial',
  maxHeight: 'initial',
  overflowY: 'auto',
  width: '16rem',
  backgroundColor: 'rgba(247,247,247)',
  margin: 0,
  padding: 0,
  borderRadius: 0,
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    willChange: 'translateX',
  },
});

interface DashboardPageTitleProps {
  title?: string;
}

export const DashboardPageTitle = ({ title }: DashboardPageTitleProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

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

  const handleCloseMobileMenu = () => setMobileMenuOpen(false);

  return (
    <React.Fragment>
      <Dialog open={mobileMenuOpen} onOpenChange={handleCloseMobileMenu}>
        <StyledDialogContent aria-label="Mobile menu">
          <DashboardSidebar />
        </StyledDialogContent>
      </Dialog>

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
            href={`/${user?.username}`}
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
