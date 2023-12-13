import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { RocketIcon } from '@radix-ui/react-icons';
import { Button, Typography } from '../ui';
import { LoginLayout } from '../modules/layout/components/LoginLayout';
import { Protected } from '../modules/auth/Protected';
import { styled } from '../stitches.config';
import { useAuth } from '../modules/auth/AuthContext';

const StyledRocketIcon = styled(RocketIcon, {
  ml: '$2',
});

const ConfigureBNS = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const checkBnsConfiguration = async () => {
      if (user && user.username) {
        try {
          const namesResponse = await fetch(
            `https://api.hiro.so/v1/names/${user.username}`,
          );
          const namesJson = (await namesResponse.json()) as {
            zonefile: string;
          };
          if (namesJson.zonefile && namesJson.zonefile !== '') {
            router.push('/');
          }
        } catch (e) {}
      }
    };

    const interval = setInterval(checkBnsConfiguration, 1000 * 10);
    return () => clearInterval(interval);
  }, [user, router]);

  return (
    <Protected>
      <LoginLayout centered>
        <Typography
          as="h1"
          size="h2"
          css={{
            mt: '$5',
            fontWeight: '600',
          }}
        >
          One last step
        </Typography>
        <Typography
          css={{
            mt: '$2',
            mb: '$3',
            color: '$gray10',
            textAlign: 'center',
          }}
        >
          Looks like your .btc name is not properly <br /> configured, follow
          the guide to update it.
        </Typography>
        <Typography
          css={{
            mt: '$2',
            mb: '$5',
            color: '$gray10',
          }}
        >
          Don’t worry, it’s easy!
        </Typography>
        <Button
          size="lg"
          color="orange"
          as="a"
          target="_blank"
          href="https://docs.sigle.io/guides/update-bns-zonefile"
        >
          Follow the guide <StyledRocketIcon />
        </Button>
        <Typography size="subparagraph" css={{ mt: '$4' }}>
          {user?.profile.stxAddress.mainnet}
        </Typography>
      </LoginLayout>
    </Protected>
  );
};

export default ConfigureBNS;
