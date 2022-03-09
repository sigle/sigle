import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '../../../modules/auth/AuthContext';
import { styled } from '../../../stitches.config';
import { Container, Flex, IconButton, Text } from '../../../ui';
import { sigleConfig } from '../../../config';
import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons';

const Footer = styled('footer', {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  pt: '$6',
  boxShadow: ' 0 0 0 1px $colors$gray6',
});

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
  alignItems: 'center',
  textAlign: 'center',
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
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already logged in we redirect him to the homepage
    if (user) {
      router.push(`/`);
    }
  }, [router, user]);

  return (
    <FullScreen>
      <LoginContainer>
        <Grid>
          <BlockText>
            <a href={sigleConfig.landingUrl} target="_blank" rel="noreferrer">
              <Image
                src="/static/img/logo.png"
                alt="Logo"
                width={100}
                height={44}
              />
            </a>
            {children}
          </BlockText>
          <BlockIllustration>
            <Image
              src="/img/illustrations/login.png"
              alt="Login illustration"
              width={600}
              height={476}
            />
          </BlockIllustration>
        </Grid>
      </LoginContainer>
      <Footer>
        <Flex css={{ mb: '$5' }} gap="3">
          <IconButton
            as="a"
            href={sigleConfig.twitterUrl}
            target="_blank"
            rel="noreferrer"
          >
            <TwitterLogoIcon />
          </IconButton>
          <IconButton
            as="a"
            href={sigleConfig.discordUrl}
            target="_blank"
            rel="noreferrer"
          >
            <DiscordLogoIcon />
          </IconButton>
          <IconButton
            as="a"
            href={sigleConfig.githubUrl}
            target="_blank"
            rel="noreferrer"
          >
            <GitHubLogoIcon />
          </IconButton>
        </Flex>
        <Flex
          css={{
            boxShadow: '0 1px 0 0 $colors$gray6',
            pb: '$3',
            justifyContent: 'center',
            width: '100%',
          }}
          gap="5"
        >
          <Text
            size="sm"
            as="a"
            target="_blank"
            rel="noreferrer"
            // LINK BELOW SHOULD BE blogUrl
            href={sigleConfig.documentationUrl}
            css={{
              color: '$gray12',
              '&:hover': {
                boxShadow: '0 1px 0 0px $colors$gray12',
              },
            }}
          >
            Blog
          </Text>
          <Text
            size="sm"
            as="a"
            target="_blank"
            rel="noreferrer"
            href={sigleConfig.documentationUrl}
            css={{
              color: '$gray12',
              '&:hover': {
                boxShadow: '0 1px 0 0px $colors$gray12',
              },
            }}
          >
            Documentation
          </Text>
          <Text
            size="sm"
            as="a"
            target="_blank"
            rel="noreferrer"
            href={sigleConfig.discordUrl}
            css={{
              color: '$gray12',
              '&:hover': {
                boxShadow: '0 1px 0 0px $colors$gray12',
              },
            }}
          >
            Support
          </Text>
          <Text
            size="sm"
            as="a"
            target="_blank"
            rel="noreferrer"
            href={sigleConfig.feedbackUrl}
            css={{
              color: '$gray12',
              '&:hover': {
                boxShadow: '0 1px 0 0px $colors$gray12',
              },
            }}
          >
            Feedback
          </Text>
        </Flex>
        <Text
          size="xs"
          css={{
            py: '$5',
            color: '$gray12',
          }}
        >
          © Sigle {new Date().getFullYear()}
        </Text>
      </Footer>
    </FullScreen>
  );
};
