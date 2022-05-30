import React, { useEffect } from 'react';
import * as Fathom from 'fathom-client';
import posthog from 'posthog-js';
import { useConnect } from '@stacks/connect-react';
import { useConnect as legacyUseConnect } from '@stacks/legacy-connect-react';
import { EyeOpenIcon, FaceIcon, RocketIcon } from '@radix-ui/react-icons';
import { Goals } from '../utils/fathom';
import { Box, Button, Flex, Typography } from '../ui';
import { useFeatureFlags } from '../utils/featureFlags';
import { LoginLayout } from '../modules/layout/components/LoginLayout';
import { useRouter } from 'next/router';
import { useAuth } from '../modules/auth/AuthContext';
import { sigleConfig } from '../config';

const Login = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { doOpenAuth } = useConnect();
  const { doOpenAuth: legacyDoOpenAuth } = legacyUseConnect();
  let { isExperimentalHiroWalletEnabled } = useFeatureFlags();

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

  const handleLoginLegacy = () => {
    Fathom.trackGoal(Goals.LOGIN, 0);
    posthog.capture('start-login-legacy');
    legacyDoOpenAuth();
  };

  return (
    <LoginLayout>
      {isExperimentalHiroWalletEnabled ? (
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
      ) : (
        <Typography>
          Sigle is a web 3.0 open source blogging platform focused on protecting
          your privacy, built on top of Stacks.
        </Typography>
      )}
      <Flex gap="3" justify="end" css={{ mt: '$7' }}>
        {isExperimentalHiroWalletEnabled ? (
          <>
            <Button
              variant="ghost"
              color="gray"
              size="lg"
              onClick={handleLoginLegacy}
            >
              Legacy login
            </Button>
            <Button color="orange" size="lg" onClick={handleLogin}>
              Connect Wallet
            </Button>
          </>
        ) : (
          <Button color="orange" size="lg" onClick={handleLoginLegacy}>
            Start Writing
          </Button>
        )}
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
