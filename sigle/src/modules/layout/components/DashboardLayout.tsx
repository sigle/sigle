import React, { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from './AppHeader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Box,
  Button,
  Container,
} from '../../../ui';
import { styled } from '../../../stitches.config';
import { AppFooter } from './AppFooter';
import { useRouter } from 'next/router';
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
import { useAuth } from '../../auth/AuthContext';
import { PenRunCard } from '../../penRunCard/PenRunCard';
import Image from 'next/future/image';

const ThemedButton = styled(Button, {
  '& img': {
    display: 'none',
  },

  variants: {
    halloween: {
      true: {
        minWidth: 120,
        backgroundColor: '$gray11',

        '&:hover': {
          backgroundColor: '#ECA25E',

          '& img': {
            display: 'block',
          },

          '& span': {
            display: 'none',
          },
        },
        '&:active': {
          backgroundColor: '#FFC997',
        },
      },
    },
  },
});

export const DashboardContainer = styled(Container, {
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

export const FullScreen = styled('div', {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  justifyContent: 'space-between',
});

export const DashboardSidebar = styled('div', {
  display: 'none',
  flexDirection: 'column',
  gap: '$3',
  '@xl': {
    display: 'flex',
  },
});

export const DashboardSidebarNavItem = styled('a', {
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
  const { user } = useAuth();
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

  const navItems = [
    {
      name: 'Drafts',
      path: '/',
    },
    {
      name: 'Published',
      path: '/published',
    },
    {
      name: 'Analytics',
      path: '/analytics',
    },
    {
      name: 'Profile',
      path: '/[username]',
    },
  ];

  return (
    <FullScreen>
      <AppHeader />
      <DashboardContainer {...props}>
        <DashboardSidebar>
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              as={
                item.path === '/[username]' ? `/${user?.username}` : undefined
              }
              passHref
            >
              <DashboardSidebarNavItem selected={router.pathname === item.path}>
                {item.name}
              </DashboardSidebarNavItem>
            </Link>
          ))}
          <ThemedButton
            halloween
            css={{
              mt: '$5',
              alignSelf: 'start',
              backgroundColor: loadingCreate ? '#FFC997' : '$gray11',
              color: loadingCreate ? '$orange11' : '$gray1',
            }}
            disabled={loadingCreate}
            onClick={handleCreateNewPrivateStory}
            size="lg"
          >
            <span>
              {!loadingCreate ? `Write a story` : `Creating a stor-Hihihi..`}
            </span>
            <Image
              width={24}
              height={20}
              alt="Pumpkin Illustration"
              src="/static/img/pumpkin-illust.svg"
            />
          </ThemedButton>
          <PenRunCard />
        </DashboardSidebar>
        <Box
          css={{
            mb: '$5',
          }}
        >
          <Accordion
            css={{
              display: 'none',
              '@md': { display: 'block' },
              '@xl': { display: 'none' },
            }}
            collapsible
            type="single"
          >
            <AccordionItem value="item1">
              <AccordionTrigger>
                {navItems.find((item) => item.path === router.pathname)?.name}
              </AccordionTrigger>
              <AccordionContent>
                {navItems
                  .filter((item) => item.path !== router.pathname)
                  .map((item) => (
                    <Link key={item.path} href={item.path} passHref>
                      <DashboardSidebarNavItem variant="accordion">
                        {item.name}
                      </DashboardSidebarNavItem>
                    </Link>
                  ))}
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
