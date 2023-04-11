import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  Typography,
} from '@sigle/ui';
import { useAuthModalStore } from './store';
import { useAuth as useStacksAuth } from '@micro-stacks/react';
import { styled } from '@sigle/stitches.config';

const StyledDialogContent = styled(DialogContent, {
  maxWidth: '360px',
  px: '$6',
  py: '$6',
});

/**
 * Auth modal that handles wallet connect and sign in with Stacks.
 */
export const AuthModal = () => {
  const { openAuthRequest } = useStacksAuth();
  const open = useAuthModalStore((state) => state.open);
  const setOpen = useAuthModalStore((state) => state.setOpen);

  const connectWallet = () => {
    // TODO if wallet not installed show message with install link
    openAuthRequest();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <StyledDialogContent>
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
      </StyledDialogContent>
    </Dialog>
  );
};

export const useAuthModal = () => {
  const open = useAuthModalStore((state) => state.open);
  const setOpen = useAuthModalStore((state) => state.setOpen);

  return { open, setOpen };
};
