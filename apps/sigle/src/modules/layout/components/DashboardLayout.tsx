import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { VariantProps } from '@stitches/react';
import { Button } from '@radix-ui/themes';
import { styled } from '../../../stitches.config';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Box,
  Container,
} from '../../../ui';
import { useAuth } from '../../auth/AuthContext';
import { AppFooter } from './AppFooter';
import { AppHeader } from '../../../components/layout/header/header';

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
              legacyBehavior
            >
              <DashboardSidebarNavItem selected={router.pathname === item.path}>
                {item.name}
              </DashboardSidebarNavItem>
            </Link>
          ))}
          <Button
            className="mt-1 self-start"
            size="3"
            color="gray"
            highContrast
            asChild
          >
            <Link href="/stories/new">Write a story</Link>
          </Button>
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
                    <Link
                      key={item.path}
                      href={item.path}
                      passHref
                      legacyBehavior
                    >
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
