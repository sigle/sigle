import React, { useEffect } from 'react';
import * as Fathom from 'fathom-client';
import posthog from 'posthog-js';
import { useConnect } from '@stacks/connect-react';
import { Goals } from '../utils/fathom';
import { Button, Heading } from '../ui';
import { LoginLayout } from '../modules/layout/components/LoginLayout';
import { useRouter } from 'next/router';
import { useAuth } from '../modules/auth/AuthContext';

const Login = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { doOpenAuth } = useConnect();

  useEffect(() => {
    // If user is already logged in or has a username we redirect him to the homepage
    if (user) {
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
        size="lg"
        css={{
          mt: '$3',
          fontWeight: 600,
          fontSize: 22,
        }}
      >
        Where Web3 stories come to life
      </Heading>
      <Button color="orange" size="lg" onClick={handleLogin} css={{ mt: '$7' }}>
        Connect Wallet
      </Button>
    </LoginLayout>
  );
};

export default Login;
