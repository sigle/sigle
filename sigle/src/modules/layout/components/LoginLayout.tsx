import React from 'react';
import Image from 'next/image';
import { styled } from '../../../stitches.config';
import { Box, Container } from '../../../ui';
import { sigleConfig } from '../../../config';
import { useTheme } from 'next-themes';
import { AppFooter } from './AppFooter';

const FullScreen = styled('div', {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const LoginContainer = styled(Container, {
  my: 'auto',
  '@xl': {
    maxWidth: '1024px',
  },
});

const Grid = styled('div', {
  display: 'grid',
  '@lg': {
    gridTemplateColumns: '2fr 3fr',
    gridGap: '$15',
  },
});

const BlockText = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const BlockIllustration = styled('div', {
  display: 'none',
  '@lg': {
    display: 'block',
  },
});

interface LoginLayoutProps {
  children: React.ReactNode;
}

export const LoginLayout = ({ children }: LoginLayoutProps) => {
  const { resolvedTheme } = useTheme();

  let src;

  switch (resolvedTheme) {
    case 'dark':
      src = '/static/img/logo_white.png';
      break;
    default:
      src = '/static/img/logo.png';
      break;
  }

  return (
    <FullScreen>
      <LoginContainer>
        <Grid>
          <BlockText>
            <Box
              as="a"
              css={{ mb: '$15' }}
              href={sigleConfig.landingUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Image src={src} alt="Logo" width={123} height={45} />
            </Box>
            {children}
          </BlockText>
          <BlockIllustration>
            <Image
              src="/img/illustrations/login.png"
              alt="Login illustration"
              width={600}
              height={476}
              priority
            />
          </BlockIllustration>
        </Grid>
      </LoginContainer>
      <AppFooter />
    </FullScreen>
  );
};
