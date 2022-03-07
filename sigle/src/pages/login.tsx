import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import * as Fathom from 'fathom-client';
import { useConnect } from '@stacks/connect-react';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { sigleConfig } from '../config';
import { Goals } from '../utils/fathom';
import { useAuth } from '../modules/auth/AuthContext';
import { styled } from '../stitches.config';
import { Box, Button, Container, Heading, Text } from '../ui';
import { isExperimentalHiroWalletEnabled } from '../utils/featureFlags';

const FullScreen = styled('div', {
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
});

const LoginContainer = styled(Container, {
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
              css={{ mt: isExperimentalHiroWalletEnabled ? '$8' : '$15' }}
            >
              {isExperimentalHiroWalletEnabled
                ? 'Connect, Write, Earn*'
                : 'Welcome!'}
            </Heading>
            <Text
              css={{
                mt: isExperimentalHiroWalletEnabled ? '$2' : '$7',
                color: isExperimentalHiroWalletEnabled ? '$gray8' : '$gray10',
              }}
            >
              {isExperimentalHiroWalletEnabled
                ? '*Monetisation coming soon'
                : `Sigle is a web 3.0 open source blogging platform focused on{' '}
              <strong>protecting your privacy</strong>, built on top of Stacks.`}
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
              css={{ mt: isExperimentalHiroWalletEnabled ? '$2' : '$7' }}
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
                css={{ mt: '$4' }}
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
    </FullScreen>
  );
};

export default Login;
