import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import * as Fathom from 'fathom-client';
import { useConnect } from '@stacks/connect-react';
import { sigleConfig } from '../config';
import { Goals } from '../utils/fathom';
import { useAuth } from '../modules/auth/AuthContext';
import { styled } from '../stitches.config';
import { Button, Container, Heading, Text } from '../ui';

const FullScreen = styled('div', {
  mt: '$20',
  '@lg': {
    mt: 0,
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
  },
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
    gridGap: '$10',
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
  }, [user]);

  return (
    <FullScreen>
      <LoginContainer>
        <Grid>
          <BlockText>
            <a href={sigleConfig.landingUrl} target="_blank" rel="noreferrer">
              <Image
                // TODO change to SVG
                src="/static/img/logo.png"
                alt="Logo"
                width={100}
                height={44}
              />
            </a>
            <Heading as="h1" size="2xl" css={{ mt: '$15' }}>
              Connect with Stacks
            </Heading>
            <Text css={{ mt: '$7' }}>
              Decentralised platforms baked on top of Stacks need you to connect
              with an ID.
            </Text>
            <Text css={{ mt: '$5' }}>
              Stacks ID provides user-controlled login and storage that enable
              you to take back control of your identity and data.
            </Text>
            <Button
              color="orange"
              size="lg"
              onClick={handleLogin}
              css={{ mt: '$7' }}
            >
              Connect with Stacks
            </Button>
          </BlockText>
          <BlockIllustration>
            <Image
              src="/img/illustrations/login.png"
              alt="Login illustration"
              // TODO correct max width
              width={1200}
              height={951}
            />
          </BlockIllustration>
        </Grid>
      </LoginContainer>
    </FullScreen>
  );
};

export default Login;
