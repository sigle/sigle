import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  Typography,
} from '@sigle/ui';
import { useAuthModalStore } from './store';

/**
 * Auth modal that handles wallet connect and sign in with Stacks.
 */
export const AuthModal = () => {
  const open = useAuthModalStore((state) => state.open);
  const setOpen = useAuthModalStore((state) => state.setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle asChild>
          <Typography size="xl" fontWeight="bold">
            Connect wallet
          </Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <Flex mt="3" direction="column">
            <Typography>TODO</Typography>
          </Flex>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export const useAuthModal = () => {
  const open = useAuthModalStore((state) => state.open);
  const setOpen = useAuthModalStore((state) => state.setOpen);

  return { open, setOpen };
};
