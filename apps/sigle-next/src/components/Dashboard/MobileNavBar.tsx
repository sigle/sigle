import * as DialogPrimitive from '@radix-ui/react-dialog';
import React from 'react';
import { keyframes, styled } from '@sigle/stitches.config';
import { DialogOverlay } from '@sigle/ui';
import { useDashboardStore } from './store';
import { NavBar } from './NavBar';

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-100%)' },
  '100%': { opacity: 1, transform: 'translateX(0%)' },
});
const contentHide = keyframes({
  '0%': { opacity: 1, transform: 'translateX(0%)' },
  '100%': { opacity: 0, transform: 'translateX(-100%)' },
});

const StyledContent = styled(DialogPrimitive.Content, {
  backgroundColor: '$gray1',
  color: '$gray11',
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  width: '83%',
  maxWidth: '100%',
  transform: 'translateX(0)',
  borderLeft: 'solid 1px $gray6',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '$5',
  overflowY: 'scroll',
  willChange: 'translateX',

  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': {
      animation: `${contentShow} 150ms $transitions$ease-in-out`,
    },
    '&[data-state="closed"]': {
      animation: `${contentHide} 150ms $transitions$ease-in-out`,
    },
  },
});

export const MobileNavBar = () => {
  const open = useDashboardStore((state) => state.open);
  const setOpen = useDashboardStore((state) => state.setOpen);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogPrimitive.Portal>
        <DialogOverlay />
        <StyledContent>
          <NavBar />
        </StyledContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
