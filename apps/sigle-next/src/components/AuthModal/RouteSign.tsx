import { useAccount, useOpenSignMessage } from '@micro-stacks/react';
import Image from 'next/image';
import { TbCircleCheck, TbArrowRight, TbReload } from 'react-icons/tb';
import { getCsrfToken, signIn } from 'next-auth/react';
import { RedirectableProviderType } from 'next-auth/providers';
import { useState } from 'react';
import { styled } from '@sigle/stitches.config';
import {
  Button,
  DialogDescription,
  DialogDivider,
  DialogTitle,
  Flex,
  Typography,
} from '@sigle/ui';
import { addressAvatar } from '@/utils';
import { nextImageLoader } from '@/utils/nextImageLoader';
import { useToast } from '@/hooks/useToast';
import { SignInWithStacksMessage } from '@/lib/auth/sign-in-with-stacks/signInWithStacksMessage';
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
  const setOpen = useAuthModalStore((state) => state.setOpen);
  const { toast } = useToast();

  const signMessage = async () => {
    if (!stxAddress) {
      return;
    }

    setSigningState('loading');

    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      setSigningState('inactive');
      throw new Error('No csrf token');
    }

    const stacksMessage = new SignInWithStacksMessage({
      domain: `${window.location.protocol}//${window.location.host}`,
      address: stxAddress,
      // TODO custom statement with privacy policy
      statement: 'Sign in with Stacks to the app.',
      uri: window.location.origin,
      version: '1',
      chainId: 1,
      nonce: csrfToken,
    });

    if (!stacksMessage) {
      setSigningState('cancelled');
      return;
    }
    const message = stacksMessage.toMessage();
    const signature = await openSignMessage({ message });
    if (!signature) {
      setSigningState('cancelled');
      return;
    }
    const signInResult = await signIn<RedirectableProviderType>('credentials', {
      chain: 'stacks',
      message,
      redirect: false,
      signature: signature.signature,
      callbackUrl: '/protected',
    });
    if (signInResult && signInResult.error) {
      toast({
        description: 'Failed to login',
        variant: 'error',
      });
      setSigningState('cancelled');
      return;
    }
    toast({
      description: 'Logged in successfully',
    });
    setSigningState('complete');
    setOpen(false);
  };

  return (
    <>
      <DialogTitle asChild>
        <Typography size="md" fontWeight="bold" css={{ textAlign: 'center' }}>
          Sign In With Stacks
        </Typography>
      </DialogTitle>
      <DialogDescription asChild>
        <>
          <Typography
            size="sm"
            color="gray9"
            css={{ textAlign: 'center', mt: '$3' }}
          >
            This app would like to verify you as the owner of this wallet.
          </Typography>
          <Flex
            justify="center"
            align="center"
            gap="7"
            css={{
              pt: '$8',
              pb: '$4',
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
          <Typography size="xs" css={{ textAlign: 'center' }}>
            Please sign the message request in your wallet to continue.
          </Typography>
          <DialogDivider />
          <Flex direction="column">
            {signingState === 'loading' && (
              <Button size="lg" disabled>
                Awaiting Confirmation...
              </Button>
            )}
            {signingState === 'inactive' && (
              <Button
                size="lg"
                onClick={signMessage}
                rightIcon={<TbArrowRight />}
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
        </>
      </DialogDescription>
    </>
  );
};
