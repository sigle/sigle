import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import * as Fathom from 'fathom-client';
import { useConnect } from '@stacks/connect-react';
import {
  ArrowTopRightIcon,
  DiscordLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons';
import { sigleConfig } from '../config';
import { Goals } from '../utils/fathom';
import { useAuth } from '../modules/auth/AuthContext';
import { styled } from '../stitches.config';
import { Box, Button, Container, Flex, Heading, IconButton, Text } from '../ui';
import { isExperimentalHiroWalletEnabled } from '../utils/featureFlags';

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

const Login = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { doOpenAuth } = useConnect();

  const handleLogin = () => {
    Fathom.trackGoal(Goals.LOGIN, 0);
    doOpenAuth();
  };

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
            <Heading
              as="h1"
              size="2xl"
              css={{
                mt: isExperimentalHiroWalletEnabled ? '$7' : '$15',
                fontWeight: !isExperimentalHiroWalletEnabled
                  ? '600'
                  : undefined,
              }}
            >
              {isExperimentalHiroWalletEnabled
                ? 'Connect, Write, Earn*'
                : 'Welcome!'}
            </Heading>
            <Text
              css={{
                mt: isExperimentalHiroWalletEnabled ? '$2' : '$7',
                color: isExperimentalHiroWalletEnabled ? '$gray9' : '$gray10',
                fontStyle: isExperimentalHiroWalletEnabled
                  ? 'italic'
                  : undefined,
              }}
            >
              {isExperimentalHiroWalletEnabled ? (
                '(*Monetisation coming soon)'
              ) : (
                <span>
                  Sigle is a web 3.0 open source blogging platform focused on{' '}
                  <strong>protecting your privacy</strong>, built on top of
                  Stacks.
                </span>
              )}
            </Text>
            {isExperimentalHiroWalletEnabled ? null : (
              <Text
                color="orange"
                size="action"
                as="a"
                target="_blank"
                rel="noreferrer"
                href="https://www.stacks.co/what-is-stacks"
                css={{ mt: '$5', display: 'flex', alignItems: 'center' }}
              >
                What is Stacks?
                <Box as="span" css={{ ml: '$2' }}>
                  <ArrowTopRightIcon height={16} width={16} />
                </Box>
              </Text>
            )}
            <Button
              color="orange"
              size="lg"
              onClick={handleLogin}
              css={{ mt: '$7' }}
            >
              {isExperimentalHiroWalletEnabled
                ? 'Connect Wallet'
                : 'Start Writing'}
            </Button>
            {isExperimentalHiroWalletEnabled ? (
              <Button
                variant="ghost"
                color="gray"
                size="lg"
                onClick={handleLogin}
                css={{ mt: '$3' }}
              >
                Legacy login
              </Button>
            ) : null}
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
            href={sigleConfig.blogUrl}
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

export default Login;
