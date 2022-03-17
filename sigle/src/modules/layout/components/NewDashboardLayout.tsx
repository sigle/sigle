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
      css={{
        py: '$3',
        px: '$3',
        br: '$2',
        alignSelf: 'start',
        backgroundColor:
          router.pathname === props.href ? '$gray3' : 'transparent',

        '&:hover': {
          backgroundColor:
            router.pathname === props.href ? undefined : '$gray5',
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

export const NewDashboardLayout = () => {
  return (
    <FullScreen>
      <AppHeader />
      <Container
        css={{
          display: 'flex',
          mt: '$10',
          width: '100%',
          height: '100%',
        }}
      >
        <Sidebar>
          <Link href="/dashboard" passHref>
            <NavItem>Profile</NavItem>
          </Link>
          <Link href="/" passHref>
            <NavItem>Bookmarks</NavItem>
          </Link>
          <Link href="/" passHref>
            <NavItem>Analytics</NavItem>
          </Link>
          <Link href="/" passHref>
            <NavItem>Settings</NavItem>
          </Link>
        </Sidebar>
      </Container>
      <AppFooter />
    </FullScreen>
  );
};
