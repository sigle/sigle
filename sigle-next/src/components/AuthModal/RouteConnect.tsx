import { useAuth as useStacksAuth } from '@micro-stacks/react';
import {
  Button,
  DialogDescription,
  DialogTitle,
  Flex,
  Typography,
} from '@sigle/ui';
import { useAuthModalStore } from './store';

export const RouteConnect = () => {
  const { openAuthRequest } = useStacksAuth();
  const setRoute = useAuthModalStore((state) => state.setRoute);

  const connectWallet = () => {
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
          Connect wallet
        </Typography>
      </DialogTitle>
      <DialogDescription asChild>
        <Flex mt="5" direction="column" gap="3">
          <Button size="lg" onClick={connectWallet}>
            Hiro Wallet
          </Button>
          <Button size="lg" onClick={connectWallet}>
            Xverse Wallet
          </Button>
        </Flex>
      </DialogDescription>
    </>
  );
};
