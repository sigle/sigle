import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Heading, Text } from '../ui';
import { LoginLayout } from '../modules/layout/components/LoginLayout';
import { RocketIcon } from '@radix-ui/react-icons';
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
            `https://stacks-node-api.stacks.co/v1/names/${user.username}`
          );
          const namesJson = (await namesResponse.json()) as {
            zonefile: string;
          };
          if (namesJson.zonefile !== '') {
            router.push('/');
          }
        } catch (e) {}
      }
    };

    const interval = setInterval(checkBnsConfiguration, 1000 * 10);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <Protected>
      <LoginLayout>
        <Heading
          as="h1"
          size="2xl"
          css={{
            mt: '$5',
            fontWeight: '600',
          }}
        >
          One last step
        </Heading>
        <Text
          css={{
            mt: '$2',
            mb: '$3',
            color: '$gray10',
          }}
        >
          Looks like your .btc name is not properly configured, follow the guide
          to update it.
        </Text>
        <Text
          css={{
            mt: '$2',
            mb: '$3',
            color: '$gray10',
          }}
        >
          Don’t worry, it’s easy!
        </Text>
        <Button
          size="lg"
          color="orange"
          as="a"
          target="_blank"
          href="https://docs.sigle.io/guides/update-bns-zonefile"
        >
          Follow the guide <StyledRocketIcon />
        </Button>
      </LoginLayout>
    </Protected>
  );
};

export default ConfigureBNS;
