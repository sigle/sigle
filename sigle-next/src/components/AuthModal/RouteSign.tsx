import { useAccount, useAuth as useStacksAuth } from '@micro-stacks/react';
import {
  Button,
  DialogDescription,
  DialogTitle,
  Flex,
  Typography,
} from '@sigle/ui';
import { useAuthModalStore } from './store';
import Image from 'next/image';
import { nextImageLoader } from '@/utils/nextImageLoader';
import { addressAvatar } from '@/utils';
import { styled } from '@sigle/stitches.config';
import { TbCircleCheck } from 'react-icons/tb';

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
  const { openAuthRequest } = useStacksAuth();
  const { stxAddress } = useAccount();
  const setRoute = useAuthModalStore((state) => state.setRoute);

  const signMessage = () => {
    // TODO loading state once connect popup is open
    // TODO if wallet not installed show message with install link
    openAuthRequest({
      onFinish: () => {
        setRoute('sign');
      },
      onCancel: () => {
        // TODO
      },
    });
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
          <Button size="lg" onClick={signMessage}>
            Sign in
          </Button>
        </Flex>
      </DialogDescription>
    </>
  );
};
