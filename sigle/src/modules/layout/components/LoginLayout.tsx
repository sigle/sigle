import React from 'react';
import Image from 'next/legacy/image';
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
  '@lg': {
    py: '$10',
  },
  '@xl': {
    maxWidth: '1440px',
  },
});

const Grid = styled('div', {
  display: 'grid',
  placeItems: 'center',
  '@lg': {
    gridTemplateColumns: '2fr 3fr',
    gridGap: '$15',
  },
});

const BlockText = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  maxWidth: 500,
});

const BlockIllustration = styled('div', {
  display: 'none',
  '@lg': {
    display: 'block',
  },
});

interface LoginLayoutProps {
  children: React.ReactNode;
  centered?: boolean;
}

export const LoginLayout = ({
  children,
  centered = false,
}: LoginLayoutProps) => {
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
          <BlockText
            css={{
              alignItems: centered ? 'center' : 'start',
            }}
          >
            <Box
              as="a"
              href={sigleConfig.landingUrl}
              target="_blank"
              rel="noreferrer"
              css={{ pt: '$5', '@md': { pt: 0 } }}
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
