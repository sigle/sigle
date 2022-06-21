import React, { useEffect } from 'react';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import * as Fathom from 'fathom-client';
import posthog from 'posthog-js';
import { useConnect } from '@stacks/connect-react';
import { useConnect as legacyUseConnect } from '@stacks/legacy-connect-react';
import {
  EyeOpenIcon,
  FaceIcon,
  RocketIcon,
  SunIcon,
  ArrowLeftIcon,
} from '@radix-ui/react-icons';
import { Goals } from '../utils/fathom';
import { Box, Button, Flex, Typography } from '../ui';
import { LoginLayout } from '../modules/layout/components/LoginLayout';
import { useRouter } from 'next/router';
import { useAuth } from '../modules/auth/AuthContext';
import { SignInWithStacksMessage } from '../modules/auth/sign-in-with-stacks/signInWithStacksMessage';
import { sigleConfig } from '../config';
import { useFeatureFlags } from '../utils/featureFlags';

const Login = () => {
  const router = useRouter();
  const { user, isLegacy, logout } = useAuth();
  const { status } = useSession();
  const { doOpenAuth, sign } = useConnect();
  const { doOpenAuth: legacyDoOpenAuth } = legacyUseConnect();
  const { isExperimentalAnalyticsPageEnabled } = useFeatureFlags();

  useEffect(() => {
    // We keep the user on the login page so he can sign the message
    if (
      isExperimentalAnalyticsPageEnabled &&
      user &&
      status !== 'authenticated'
    ) {
      return;
    }

    // If user is already logged in we redirect him to the homepage
    if (user) {
      router.push(`/`);
    }
  }, [router, user, isLegacy, status, isExperimentalAnalyticsPageEnabled]);

  const handleLogin = () => {
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
      {isExperimentalAnalyticsPageEnabled ? (
        <Typography size="h3" as="h3" css={{ mb: '$1', fontWeight: 600 }}>
          {!user ? 'Step 1' : 'Step 2'}
        </Typography>
      ) : null}
      {user ? (
        <Typography>
          In order to prove the ownership of your address and to verify your
          identity, we need you to sign a message.
        </Typography>
      ) : (
        <>
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
        </>
      )}
      <Flex gap="3" justify="end" css={{ mt: '$7' }}>
        {!user ? (
          <Button
            variant="ghost"
            color="gray"
            size="lg"
            onClick={handleLoginLegacy}
          >
            Blockstack connect
          </Button>
        ) : (
          <Button
            variant="ghost"
            color="gray"
            size="lg"
            css={{ gap: '$2' }}
            onClick={logout}
          >
            <ArrowLeftIcon width={15} height={15} />
            Change account
          </Button>
        )}
        <Button
          color="orange"
          size="lg"
          onClick={
            isExperimentalAnalyticsPageEnabled && user
              ? handleSignMessage
              : handleLogin
          }
        >
          {isExperimentalAnalyticsPageEnabled && user
            ? 'Sign message'
            : 'Connect Wallet'}
        </Button>
      </Flex>
      <Box as="hr" css={{ mt: '$3', borderColor: '$gray6' }} />
      <Flex direction="column" gap="3" css={{ mt: '$3', color: '$gray9' }}>
        {!user ? (
          <>
            <Flex css={{ gap: '$3' }} align="center">
              <div>
                <EyeOpenIcon width={15} height={15} />
              </div>
              <Typography size="subheading" css={{ color: '$gray9' }}>
                We will never do anything without your approval and we only need
                view only permissions.
              </Typography>
            </Flex>
            <Flex css={{ gap: '$3' }} align="center">
              <div>
                <FaceIcon width={15} height={15} />
              </div>
              <Typography size="subheading" css={{ color: '$gray9' }}>
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
              <Typography size="subheading" css={{ color: '$gray9' }}>
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
          </>
        ) : (
          <Flex css={{ gap: '$3' }} align="center">
            <div>
              <SunIcon width={15} height={15} />
            </div>
            <Typography size="subheading" css={{ color: '$gray9' }}>
              This signature won’t cost you any Stacks (STX).
            </Typography>
          </Flex>
        )}
      </Flex>
    </LoginLayout>
  );
};

export default Login;
