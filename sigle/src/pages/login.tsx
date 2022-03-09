import React, { useEffect } from 'react';
import * as Fathom from 'fathom-client';
import posthog from 'posthog-js';
import { useConnect } from '@stacks/connect-react';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { Goals } from '../utils/fathom';
import { Box, Button, Heading, Text } from '../ui';
import { isExperimentalHiroWalletEnabled } from '../utils/featureFlags';
import { LoginLayout } from '../modules/layout/components/LoginLayout';
import { useRouter } from 'next/router';
import { useAuth } from '../modules/auth/AuthContext';

const Login = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { doOpenAuth } = useConnect();

  useEffect(() => {
    // If user is already logged in or has a username we redirect him to the homepage
    if (user && user.username) {
      router.push(`/`);
    }
  }, [router, user]);

  const handleLogin = () => {
    Fathom.trackGoal(Goals.LOGIN, 0);
    posthog.capture('start-login');
    doOpenAuth();
  };

  return (
    <LoginLayout>
      <Heading
        as="h1"
        size="2xl"
        css={{
          mt: isExperimentalHiroWalletEnabled ? '$7' : '$15',
          fontWeight: !isExperimentalHiroWalletEnabled ? '600' : undefined,
        }}
      >
        {isExperimentalHiroWalletEnabled ? 'Connect, Write, Earn*' : 'Welcome!'}
      </Heading>
      <Text
        css={{
          mt: isExperimentalHiroWalletEnabled ? '$2' : '$7',
          color: isExperimentalHiroWalletEnabled ? '$gray9' : '$gray10',
          fontStyle: isExperimentalHiroWalletEnabled ? 'italic' : undefined,
        }}
      >
        {isExperimentalHiroWalletEnabled ? (
          '(*Monetisation coming soon)'
        ) : (
          <span>
            Sigle is a web 3.0 open source blogging platform focused on{' '}
            <strong>protecting your privacy</strong>, built on top of Stacks.
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
      <Button color="orange" size="lg" onClick={handleLogin} css={{ mt: '$7' }}>
        {isExperimentalHiroWalletEnabled ? 'Connect Wallet' : 'Start Writing'}
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
    </LoginLayout>
  );
};

export default Login;
