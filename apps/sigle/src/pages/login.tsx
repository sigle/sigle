import React, { useEffect, useState } from 'react';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import * as Fathom from 'fathom-client';
import posthog from 'posthog-js';
import { StacksMainnet } from '@stacks/network';
import { useConnect } from '@stacks/connect-react';
import { useConnect as legacyUseConnect } from '@stacks/legacy-connect-react';
import {
  EyeOpenIcon,
  FaceIcon,
  RocketIcon,
  SunIcon,
  ArrowLeftIcon,
  CheckIcon,
} from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { Goals } from '../utils/fathom';
import { Box, Button, Flex, Typography } from '../ui';
import { LoginLayout } from '../modules/layout/components/LoginLayout';
import { useAuth } from '../modules/auth/AuthContext';
import { SignInWithStacksMessage } from '../modules/auth/sign-in-with-stacks/signInWithStacksMessage';
import { sigleConfig } from '../config';
import { styled } from '../stitches.config';

const ProgressCircle = styled('div', {
  display: 'grid',
  placeItems: 'center',
  width: '$8',
  height: '$8',
  br: '$round',
  color: '$gray1',

  variants: {
    variant: {
      inactive: {
        boxShadow: '0 0 0 1px $colors$gray8',
      },
      active: {
        border: '1px dashed $colors$gray12',
      },
      complete: {
        backgroundColor: '$green11',
      },
    },
  },
});

const StepsText = styled(Typography, {
  variants: {
    active: {
      true: {
        color: '$gray12',
      },
    },
    variant: {
      inactive: {
        color: '$gray8',
      },
      active: {
        color: '$gray12',
      },
      complete: {
        color: '$green11',
      },
    },
  },
});

type SigningState = 'inactive' | 'active' | 'complete';

const Login = () => {
  const router = useRouter();
  const { user, isLegacy, logout } = useAuth();
  const { status } = useSession();
  const { doOpenAuth, sign } = useConnect();
  const { doOpenAuth: legacyDoOpenAuth } = legacyUseConnect();
  const [signingState, setSigningState] = useState<SigningState>('inactive');

  useEffect(() => {
    // We keep the user on the login page so he can sign the message
    // Legacy users don't have to sign the message
    if (user && !isLegacy && status !== 'authenticated') {
      return;
    }

    // If user is already logged in we redirect him to the homepage
    if (user) {
      router.push(`/`);
    }
  }, [router, user, isLegacy, status]);

  const handleLogin = () => {
    Fathom.trackGoal(Goals.LOGIN, 0);
    posthog.capture('start-login');
    doOpenAuth();
  };

  const handleSignMessage = async () => {
    if (!user) return;
    // TODO as this can take some time add a loading state to the button
    setSigningState('active');

    Fathom.trackGoal(Goals.LOGIN_SIGN_MESSAGE, 0);
    posthog.capture('start-login-sign-message');

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

    await sign({
      network: new StacksMainnet(),
      message,
      onFinish: async ({ signature }) => {
        const signInResult = await signIn('credentials', {
          message: message,
          redirect: false,
          signature,
          callbackUrl,
        });
        if (signInResult && signInResult.error) {
          posthog.capture('start-login-sign-message-error');
          toast.error('Failed to login');
          setSigningState('inactive');
        }
        setSigningState('complete');
      },
      onCancel: () => setSigningState('active'),
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
      <Flex gap="1" css={{ my: '$10', '@md': { my: '$15' } }} align="center">
        <Box>
          <StepsText variant={user ? 'complete' : 'active'} size="subheading">
            <StepsText
              variant={user ? 'complete' : 'active'}
              css={{ fontWeight: 600 }}
              size="h3"
              as="span"
            >
              01{' '}
            </StepsText>
            Connect Wallet
          </StepsText>
          <Flex css={{ mt: '$2' }} gap="2" align="center">
            <ProgressCircle variant={user ? 'complete' : 'active'}>
              {user && <CheckIcon />}
            </ProgressCircle>
            <Box
              css={{
                height: 1,
                width: 143,
                backgroundColor: user ? '$green11' : '$gray8',
              }}
            />
          </Flex>
        </Box>
        <Box>
          <StepsText
            variant={
              user && signingState !== 'complete' ? 'active' : signingState
            }
            size="subheading"
          >
            <StepsText
              variant={
                user && signingState !== 'complete' ? 'active' : signingState
              }
              css={{ fontWeight: 600 }}
              size="h3"
              as="span"
            >
              02{' '}
            </StepsText>
            Sign message
          </StepsText>
          <ProgressCircle
            css={{ mt: '$2' }}
            variant={
              user && signingState !== 'complete' ? 'active' : signingState
            }
          >
            {signingState === 'complete' && <CheckIcon />}
          </ProgressCircle>
        </Box>
      </Flex>
      <Typography size="h3" as="h3" css={{ mb: '$1', fontWeight: 600 }}>
        {!user ? 'Step 1' : 'Step 2'}
      </Typography>
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
              href="https://www.hiro.so/wallet/install-web?utm_source=sigle"
              target="_blank"
              rel="noreferrer"
            >
              Hiro wallet
            </Box>{' '}
            or{' '}
            <Box
              as="a"
              css={{ color: '$orange11', boxShadow: '0 1px 0 0' }}
              href="https://www.xverse.app/?utm_source=sigle"
              target="_blank"
              rel="noreferrer"
            >
              Xverse wallet
            </Box>
            .
          </Typography>
        </>
      )}
      <Flex
        gap="3"
        justify="end"
        align="center"
        css={{
          mt: '$7',
          pb: '$3',
          width: '100%',
          boxShadow: '0 1px 0 0 $colors$gray6',
        }}
      >
        {!user ? (
          <Button
            variant="ghost"
            color="gray"
            size="lg"
            onClick={handleLoginLegacy}
          >
            Legacy login
          </Button>
        ) : (
          <Button
            variant="ghost"
            color="gray"
            size="lg"
            css={{ gap: '$2' }}
            onClick={() => {
              setSigningState('inactive');
              logout();
            }}
          >
            <ArrowLeftIcon width={15} height={15} />
            Change account
          </Button>
        )}
        <Button
          color="orange"
          size="lg"
          onClick={user ? handleSignMessage : handleLogin}
        >
          {user ? 'Sign message' : 'Connect Wallet'}
        </Button>
      </Flex>
      <Box as="hr" css={{ mt: '$3', borderColor: '$gray6' }} />
      <Flex direction="column" gap="3" css={{ mt: '$3', color: '$gray9' }}>
        {!user ? (
          <>
            <Flex css={{ gap: '$3' }}>
              <div>
                <EyeOpenIcon width={15} height={15} />
              </div>
              <Typography size="subheading" css={{ color: '$gray9' }}>
                View only permissions. We will never do anything without your
                approval.
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
                  Stacks start-up accelerator #1 cohort
                </Box>{' '}
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
