import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import * as Fathom from 'fathom-client';
import posthog from 'posthog-js';
import { useConnect } from '@stacks/connect-react';
import { useConnect as legacyUseConnect } from '@stacks/legacy-connect-react';
import { EyeOpenIcon, FaceIcon, RocketIcon } from '@radix-ui/react-icons';
import { Goals } from '../utils/fathom';
import { Box, Button, Flex, Typography } from '../ui';
import { LoginLayout } from '../modules/layout/components/LoginLayout';
import { useRouter } from 'next/router';
import { useAuth } from '../modules/auth/AuthContext';
import { SignInWithStacksMessage } from '../modules/auth/sign-in-with-stacks/signInWithStacksMessage';
import { sigleConfig } from '../config';

const Login = () => {
  const router = useRouter();
  const { user, isLegacy } = useAuth();
  const { status } = useSession();
  const { doOpenAuth, sign } = useConnect();
  const { doOpenAuth: legacyDoOpenAuth } = legacyUseConnect();

  console.log('login', { user, isLegacy, status, test: user && isLegacy });

  useEffect(() => {
    // If user is already logged in or has a username we redirect him to the homepage
    if (
      (user && isLegacy) ||
      (user && !isLegacy && status === 'authenticated')
    ) {
      router.push(`/`);
    }
  }, [router, user, isLegacy, status]);

  const handleLogin = async () => {
    Fathom.trackGoal(Goals.LOGIN, 0);
    posthog.capture('start-login');
    doOpenAuth();
  };

  const handleSignMessage = async () => {
    if (!user) return;

    Fathom.trackGoal(Goals.LOGIN_SIGN_MESSAGE, 0);

    const callbackUrl = '/protected';
    const stacksMessage = new SignInWithStacksMessage({
      domain: `${window.location.protocol}//${window.location.host}`,
      address: user.profile.stxAddress.mainnet,
      statement: 'Sign in with Stacks to the app.',
      uri: window.location.origin,
      version: '1',
      chainId: 1,
      nonce: (await getCsrfToken()) as string,
    });

    const message = stacksMessage.prepareMessage();

    // TODO handle close modal
    sign({
      message,
      onFinish: ({ signature }) => {
        signIn('credentials', {
          message: message,
          redirect: false,
          signature,
          callbackUrl,
        });
      },
    });
  };

  const handleLoginLegacy = () => {
    Fathom.trackGoal(Goals.LOGIN, 0);
    Fathom.trackGoal(Goals.LEGACY_LOGIN, 0);
    posthog.capture('start-login-legacy');
    legacyDoOpenAuth();
  };

  return (
    <LoginLayout>
      <Typography>Sigle is a decentralised platform.</Typography>
      <Typography>
        To access Sigle, you need to connect your{' '}
        <Box
          as="a"
          css={{ color: '$orange11', boxShadow: '0 1px 0 0' }}
          href="https://www.hiro.so/wallet/install-web"
          target="_blank"
          rel="noreferrer"
        >
          Hiro wallet.
        </Box>
      </Typography>
      <Flex gap="3" justify="end" css={{ mt: '$7' }}>
        <Button
          variant="ghost"
          color="gray"
          size="lg"
          onClick={handleLoginLegacy}
        >
          Blockstack connect
        </Button>
        <Button color="orange" size="lg" onClick={handleLogin}>
          Connect Wallet
        </Button>
      </Flex>
      <Box as="hr" css={{ mt: '$3', color: '$gray6' }} />
      <Flex direction="column" gap="3" css={{ mt: '$3', color: '$gray9' }}>
        <Flex css={{ gap: '$3' }} align="center">
          <div>
            <EyeOpenIcon width={15} height={15} />
          </div>
          <Typography size="subheading">
            We will never do anything without your approval and we only need
            view only permissions.
          </Typography>
        </Flex>
        <Flex css={{ gap: '$3' }} align="center">
          <div>
            <FaceIcon width={15} height={15} />
          </div>
          <Typography size="subheading">
            Code is{' '}
            <Box
              as="a"
              css={{ boxShadow: '0 1px 0 0' }}
              href={sigleConfig.githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              open-source.
            </Box>
          </Typography>
        </Flex>
        <Flex css={{ gap: '$3' }} align="center">
          <div>
            <RocketIcon width={15} height={15} />
          </div>
          <Typography size="subheading">
            Sigle was part of the{' '}
            <Box
              as="a"
              css={{ boxShadow: '0 1px 0 0' }}
              href="https://stacks.ac/teams"
              target="_blank"
              rel="noreferrer"
            >
              #1 cohort
            </Box>{' '}
            of the Stacks accelerator program.
          </Typography>
        </Flex>
      </Flex>
    </LoginLayout>
  );
};

export default Login;
