import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import * as Fathom from 'fathom-client';
import posthog from 'posthog-js';
import { useConnect } from '@stacks/connect-react';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { sigleConfig } from '../config';
import { Goals } from '../utils/fathom';
import { useAuth } from '../modules/auth/AuthContext';
import { styled } from '../stitches.config';
import { Box, Button, Container, Heading, Text } from '../ui';
import { RegisterUsername } from '../modules/login/RegisterUsername';

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

const BlockLogin = () => {
  const { doOpenAuth } = useConnect();

  const handleLogin = () => {
    Fathom.trackGoal(Goals.LOGIN, 0);
    posthog.capture('start-login');
    doOpenAuth();
  };

  return (
    <>
      <Heading as="h1" size="2xl" css={{ mt: '$15' }}>
        Welcome!
      </Heading>
      <Text css={{ mt: '$7' }}>
        Sigle is a web 3.0 open source blogging platform focused on{' '}
        <strong>protecting your privacy</strong>, built on top of Stacks.
      </Text>
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
      <Button color="orange" size="lg" onClick={handleLogin} css={{ mt: '$7' }}>
        Start Writing
      </Button>
    </>
  );
};

const Login = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already logged in or has a username we redirect him to the homepage
    if (user && user.username) {
      router.push(`/`);
    }
  }, [user]);

  const hasUsername = !!user?.username;

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

            {user && !hasUsername ? <RegisterUsername /> : <BlockLogin />}
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
