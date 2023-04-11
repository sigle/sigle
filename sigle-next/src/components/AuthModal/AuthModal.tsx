import { Dialog, DialogContent } from '@sigle/ui';
import { styled } from '@sigle/stitches.config';
import { useAuthModalStore } from './store';
import { RouteConnect } from './RouteConnect';
import { RouteSign } from './RouteSign';

const StyledDialogContent = styled(DialogContent, {
  maxWidth: '360px',
  px: '$6',
  py: '$6',
});

/**
 * Auth modal that handles wallet connect and sign in with Stacks.
 */
export const AuthModal = () => {
  const open = useAuthModalStore((state) => state.open);
  const setOpen = useAuthModalStore((state) => state.setOpen);
  const route = useAuthModalStore((state) => state.route);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <StyledDialogContent>
        {route === 'connect' && <RouteConnect />}
        {route === 'sign' && <RouteSign />}
      </StyledDialogContent>
    </Dialog>
  );
};

export const useAuthModal = () => {
  const open = useAuthModalStore((state) => state.open);
  const setOpen = useAuthModalStore((state) => state.setOpen);

  return { open, setOpen };
};
