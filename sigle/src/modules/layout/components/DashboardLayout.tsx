import React from 'react';
import Link from 'next/link';
import { AppHeader } from './AppHeader';
import { Box, Container } from '../../../ui';
import { styled } from '../../../stitches.config';
import { AppFooter } from './AppFooter';
import { useRouter } from 'next/router';

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

interface NavItemProps {
  href?: string;
  children: React.ReactNode;
}

const NavItem = ({ children, ...props }: NavItemProps) => {
  const router = useRouter();
  return (
    <Box
      {...props}
      as="a"
      css={{
        py: '$3',
        px: '$3',
        br: '$2',
        alignSelf: 'start',
        backgroundColor:
          router.pathname === props.href ? '$gray3' : 'transparent',

        '&:hover': {
          backgroundColor:
            router.pathname === props.href ? undefined : '$gray4',
        },

        '&:active': {
          backgroundColor: '$gray5',
        },
      }}
    >
      {children}
    </Box>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <FullScreen>
      <AppHeader />
      <Container
        css={{
          display: 'grid',
          flex: 1,
          mt: '$10',
          width: '100%',
          '@xl': {
            gridTemplateColumns: '1fr 826px 1fr',
          },
        }}
      >
        <Sidebar
          css={{
            display: 'none',
            '@xl': {
              display: 'flex',
            },
          }}
        >
          <Link href="/" passHref>
            <NavItem>Drafts</NavItem>
          </Link>
          <Link href="/published" passHref>
            <NavItem>Published</NavItem>
          </Link>
          <Link href="/settings" passHref>
            <NavItem>Settings</NavItem>
          </Link>
        </Sidebar>
        <Box
          css={{
            mb: '$5',
            mx: 'auto',

            '@md': {
              maxWidth: 724,
            },

            '@lg': {
              maxWidth: 834,
            },
          }}
        >
          {children}
        </Box>
      </Container>
      <AppFooter />
    </FullScreen>
  );
};
