import React, { useEffect } from 'react';
import * as Fathom from 'fathom-client';
import posthog from 'posthog-js';
// import { useConnect } from '@stacks/connect-react';
// import { useConnect as legacyUseConnect } from '@stacks/legacy-connect-react';
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
  // const { doOpenAuth } = useConnect();
  // const { doOpenAuth: legacyDoOpenAuth } = legacyUseConnect();

  useEffect(() => {
    // If user is already logged in or has a username we redirect him to the homepage
    if (user) {
      router.push(`/`);
    }
  }, [router, user]);

  const handleLogin = () => {
    Fathom.trackGoal(Goals.LOGIN, 0);
    posthog.capture('start-login');
    // doOpenAuth();
  };

  const handleLoginLegacy = () => {
    Fathom.trackGoal(Goals.LOGIN, 0);
    posthog.capture('start-login-legacy');
    // legacyDoOpenAuth();
  };

  return (
    <LoginLayout>
      {isExperimentalHiroWalletEnabled ? (
        <Heading
          as="h1"
          size="lg"
          css={{
            mt: '$3',
            fontWeight: 600,
            fontSize: 22,
          }}
        >
          Where Web3 stories come to life
        </Heading>
      ) : (
        <Heading
          as="h1"
          size="2xl"
          css={{
            mt: '$15',
          }}
        >
          Welcome!
        </Heading>
      )}

      {isExperimentalHiroWalletEnabled ? null : (
        <Text
          css={{
            mt: '$7',
            color: '$gray10',
          }}
        >
          Sigle is a web 3.0 open source blogging platform focused on{' '}
          <strong>protecting your privacy</strong>, built on top of Stacks.
        </Text>
      )}
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
        onClick={
          isExperimentalHiroWalletEnabled ? handleLogin : handleLoginLegacy
        }
        css={{ mt: '$7' }}
      >
        {isExperimentalHiroWalletEnabled ? 'Connect Wallet' : 'Start Writing'}
      </Button>
      {isExperimentalHiroWalletEnabled ? (
        <Button
          variant="ghost"
          color="gray"
          size="lg"
          onClick={handleLoginLegacy}
          css={{ mt: '$3' }}
        >
          Legacy login
        </Button>
      ) : null}
    </LoginLayout>
  );
};

export default Login;
