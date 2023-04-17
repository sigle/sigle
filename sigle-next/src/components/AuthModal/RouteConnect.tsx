import { useAuth as useStacksAuth } from '@micro-stacks/react';
import { TbWallet } from 'react-icons/tb';
import {
  Button,
  DialogDescription,
  DialogDivider,
  DialogTitle,
  Flex,
  Typography,
} from '@sigle/ui';
import { IconHiroWallet } from '@/images/IconHiroWallet';
import { IconXverseWallet } from '@/images/IconXverseWallet';
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
      <DialogTitle>
        <Typography size="md" fontWeight="bold" css={{ textAlign: 'center' }}>
          Connect wallet
        </Typography>
      </DialogTitle>
      <DialogDescription asChild>
        <>
          <Typography
            size="sm"
            color="gray9"
            css={{ textAlign: 'center', mt: '$3' }}
          >
            Choose the wallet you want to connect with. Each wallet will display
            a different account.
          </Typography>
          <DialogDivider />
          <Flex direction="column" gap="3">
            <Button
              size="lg"
              onClick={connectWallet}
              rightIcon={<IconHiroWallet />}
              css={{ justifyContent: 'space-between' }}
            >
              Hiro Wallet
            </Button>
            <Button
              size="lg"
              onClick={connectWallet}
              rightIcon={<IconXverseWallet />}
              css={{ justifyContent: 'space-between' }}
            >
              Xverse Wallet
            </Button>
            <Button
              size="sm"
              variant="ghost"
              rightIcon={<TbWallet />}
              css={{ color: '$gray9' }}
            >
              I don't have a wallet
            </Button>
          </Flex>
        </>
      </DialogDescription>
    </>
  );
};
