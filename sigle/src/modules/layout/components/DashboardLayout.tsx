import React, { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from './AppHeader';
import { Box, Button, Container } from '../../../ui';
import { styled } from '../../../stitches.config';
import { AppFooter } from './AppFooter';
import { useRouter } from 'next/router';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../ui/Accordion';
import { useFeatureFlags } from '../../../utils/featureFlags';
import { VariantProps } from '@stitches/react';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '../../../utils';
import * as Fathom from 'fathom-client';
import { Goals } from '../../../utils/fathom';
import { createSubsetStory } from '../../editor/utils';
import { toast } from 'react-toastify';

const DashboardContainer = styled(Container, {
  flex: 1,
  mt: '$10',
  width: '100%',
  display: 'grid',

  '@md': {
    justifyContent: 'center',
    gridTemplateColumns: '724px',
  },

  '@lg': {
    gridTemplateColumns: '834px',
  },

  variants: {
    layout: {
      default: {
        '@xl': {
          gridTemplateColumns: '1fr 826px 1fr',
        },
      },
      wide: {
        gridTemplateColumns: '100%',
        '@lg': {
          gridTemplateColumns: '834px',
        },
        '@xl': {
          gridTemplateColumns: '1fr 5fr',
        },
      },
    },
  },

  defaultVariants: {
    layout: 'default',
  },
});

const FullScreen = styled('div', {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  justifyContent: 'space-between',
});

const Sidebar = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
});

const NavItem = styled('a', {
  py: '$3',
  px: '$3',
  br: '$2',

  '&:hover': {
    backgroundColor: '$gray4',
  },

  '&:active': {
    backgroundColor: '$gray5',
  },

  variants: {
    variant: {
      sidebar: {
        alignSelf: 'start',
      },
      accordion: {},
    },
    selected: {
      true: {
        backgroundColor: '$gray3',
      },
    },
  },

  defaultVariants: {
    variant: 'sidebar',
  },
});

interface DashboardLayoutProps extends VariantProps<typeof DashboardContainer> {
  children: React.ReactNode;
}

export const DashboardLayout = ({
  children,
  ...props
}: DashboardLayoutProps) => {
  const router = useRouter();
  const { isExperimentalAnalyticsPageEnabled } = useFeatureFlags();
  const [loadingCreate, setLoadingCreate] = useState(false);

  let triggerName;

  switch (router.pathname) {
    case '/':
      triggerName = 'Drafts';
      break;
    case '/published':
      triggerName = 'Published';
      break;
    case '/analytics':
      triggerName = 'Analytics';
      break;
    case '/settings':
      triggerName = 'Settings';
      break;
    default:
      triggerName = 'Drafts';
      break;
  }

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
    <FullScreen>
      <AppHeader />
      <DashboardContainer {...props}>
        <Sidebar
          css={{
            display: 'none',
            '@xl': {
              display: 'flex',
            },
          }}
        >
          <Link href="/" passHref>
            <NavItem selected={router.pathname === '/'}>Drafts</NavItem>
          </Link>
          <Link href="/published" passHref>
            <NavItem selected={router.pathname === '/published'}>
              Published
            </NavItem>
          </Link>
          {isExperimentalAnalyticsPageEnabled && (
            <Link href="/analytics" passHref>
              <NavItem selected={router.pathname.includes('/analytics')}>
                Analytics
              </NavItem>
            </Link>
          )}
          <Link href="/settings" passHref>
            <NavItem selected={router.pathname === '/settings'}>
              Settings
            </NavItem>
          </Link>
          <Button
            css={{ mt: '$5', alignSelf: 'start' }}
            disabled={loadingCreate}
            onClick={handleCreateNewPrivateStory}
            size="lg"
          >
            {!loadingCreate ? `Write a story` : `Creating new story...`}
          </Button>
        </Sidebar>
        <Box
          css={{
            mb: '$5',
          }}
        >
          <Accordion
            css={{ '@xl': { display: 'none' } }}
            collapsible
            type="single"
          >
            <AccordionItem value="item1">
              <AccordionTrigger>{triggerName}</AccordionTrigger>
              <AccordionContent>
                {router.pathname !== '/' ? (
                  <Link href="/" passHref>
                    <NavItem variant="accordion">Drafts</NavItem>
                  </Link>
                ) : null}
                {router.pathname !== '/published' ? (
                  <Link href="/published" passHref>
                    <NavItem variant="accordion">Published</NavItem>
                  </Link>
                ) : null}
                {router.pathname !== '/analytics' ? (
                  <Link href="/analytics" passHref>
                    <NavItem variant="accordion">Analytics</NavItem>
                  </Link>
                ) : null}
                {router.pathname !== '/settings' ? (
                  <Link href="/settings" passHref>
                    <NavItem variant="accordion">Settings</NavItem>
                  </Link>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          {children}
        </Box>
      </DashboardContainer>
      <AppFooter />
    </FullScreen>
  );
};
