import { useAccount, useOpenSignMessage } from '@micro-stacks/react';
import Image from 'next/image';
import { TbCircleCheck, TbChevronRight, TbReload } from 'react-icons/tb';
import { useMicroStacksClient } from '@micro-stacks/react';
import { getCsrfToken, signIn } from 'next-auth/react';
import { RedirectableProviderType } from 'next-auth/providers';
import { useState } from 'react';
import { styled } from '@sigle/stitches.config';
import {
  Button,
  DialogDescription,
  DialogTitle,
  Flex,
  Typography,
} from '@sigle/ui';
import { addressAvatar } from '@/utils';
import { nextImageLoader } from '@/utils/nextImageLoader';
import { useAuthModalStore } from './store';

const AvatarContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  overflow: 'hidden',
  width: 50,
  height: 50,
  br: '$xs',
});

export const RouteSign = () => {
  const [signingState, setSigningState] = useState<
    'inactive' | 'loading' | 'complete' | 'cancelled'
  >('inactive');
  const { stxAddress } = useAccount();
  const { openSignMessage } = useOpenSignMessage();
  const client = useMicroStacksClient();
  const setOpen = useAuthModalStore((state) => state.setOpen);

  const signMessage = async () => {
    setSigningState('loading');

    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      setSigningState('inactive');
      throw new Error('No csrf token');
    }
    // TODO custom statement with privacy policy
    const stacksMessage = client.getSignInMessage({
      domain: `${window.location.protocol}//${window.location.host}`,
      nonce: csrfToken,
      // TODO remove version field once https://github.com/fungible-systems/micro-stacks/pull/184 is merged
      version: '1',
    });
    if (stacksMessage) {
      const message = stacksMessage.toMessage();
      const signature = await openSignMessage({ message });
      if (!signature) {
        setSigningState('cancelled');
        return;
      }
      if (signature) {
        const signInResult = await signIn<RedirectableProviderType>(
          'credentials',
          {
            message,
            redirect: false,
            signature,
            callbackUrl: '/protected',
          }
        );
      }
      // if (signInResult && signInResult.error) {
      //   posthog.capture('start-login-sign-message-error');
      //   toast.error('Failed to login');
      //   setSigningState('inactive');
      // }
      // setSigningState('complete');
      console.log('signature', signature);
    }
  };

  return (
    <>
      <DialogTitle asChild>
        <Typography size="lg" fontWeight="bold" css={{ textAlign: 'center' }}>
          Sign In With Stacks
        </Typography>
      </DialogTitle>
      <DialogDescription asChild>
        <Flex mt="5" direction="column" gap="3">
          <Typography color="gray9">
            This app would like to verify you as the owner of this wallet.
          </Typography>
          <Flex
            justify="center"
            align="center"
            gap="7"
            css={{
              py: '$8',
            }}
          >
            <AvatarContainer>
              <Image
                loader={nextImageLoader}
                src={addressAvatar(stxAddress || '', 50)}
                alt="Picture of the address"
                width={50}
                height={50}
              />
            </AvatarContainer>
            <TbCircleCheck size={16} />
            <AvatarContainer>
              <Image
                loader={nextImageLoader}
                src={'https://app.sigle.io/icon-192x192.png'}
                alt="Picture of the address"
                width={50}
                height={50}
              />
            </AvatarContainer>
          </Flex>
          <Typography color="gray9">
            Please sign the message request in your wallet to continue.
          </Typography>
          {signingState === 'loading' && (
            <Button size="lg" disabled>
              Awaiting Confirmation...
            </Button>
          )}
          {signingState === 'inactive' && (
            <Button
              size="lg"
              onClick={signMessage}
              rightIcon={<TbChevronRight />}
            >
              Sign in
            </Button>
          )}
          {signingState === 'cancelled' && (
            <Button size="lg" onClick={signMessage} rightIcon={<TbReload />}>
              Try again
            </Button>
          )}
        </Flex>
      </DialogDescription>
    </>
  );
};
