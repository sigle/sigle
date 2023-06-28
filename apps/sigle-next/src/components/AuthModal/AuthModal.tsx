import { Dialog, DialogContent } from '@sigle/ui';
import { useAuthModalStore } from './store';
import { RouteSelectChain } from './RouteSelectChain';
import { RouteConnect } from './RouteConnect';
import { RouteSign } from './RouteSign';

/**
 * Auth modal that handles wallet connect and sign in with Stacks.
 */
export const AuthModal = () => {
  const open = useAuthModalStore((state) => state.open);
  const setOpen = useAuthModalStore((state) => state.setOpen);
  const route = useAuthModalStore((state) => state.route);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {route === 'select-chain' && <RouteSelectChain />}
        {route === 'connect' && <RouteConnect />}
        {route === 'sign' && <RouteSign />}
      </DialogContent>
    </Dialog>
  );
};

export const useAuthModal = () => {
  const open = useAuthModalStore((state) => state.open);
  const setOpen = useAuthModalStore((state) => state.setOpen);

  return { open, setOpen };
};
