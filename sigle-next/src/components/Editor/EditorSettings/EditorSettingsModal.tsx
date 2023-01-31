import * as DialogPrimitive from '@radix-ui/react-dialog';
import React from 'react';
import { keyframes, styled } from '@sigle/stitches.config';
import { useEditorStore } from '../store';

const overlayOpacity = 0.7;
const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: overlayOpacity },
});

const overlayHide = keyframes({
  '0%': { opacity: overlayOpacity },
  '100%': { opacity: 0 },
});

const StyledOverlay = styled(DialogPrimitive.Overlay, {
  position: 'fixed',
  // Size of the editor header
  top: '80px',
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: '$gray3',
  opacity: overlayOpacity,

  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': {
      animation: `${overlayShow} 150ms $transitions$ease-in`,
    },
    '&[data-state="closed"]': {
      animation: `${overlayHide} 150ms $transitions$ease-in`,
    },
  },
});

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translateX(100%)' },
  '100%': { opacity: 1, transform: 'translateX(0%)' },
});
const contentHide = keyframes({
  '0%': { opacity: 1, transform: 'translateX(0%)' },
  '100%': { opacity: 0, transform: 'translateX(100%)' },
});

const StyledContent = styled(DialogPrimitive.Content, {
  backgroundColor: '$gray1',
  color: '$gray11',
  position: 'fixed',
  // Size of the editor header
  top: '80px',
  bottom: 0,
  right: 0,
  width: '420px',
  maxWidth: '100%',
  transform: 'translateX(0)',
  borderLeft: 'solid 1px $gray6',
  display: 'flex',
  flexDirection: 'column',
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

type EditorSettingsModalProps = React.ComponentProps<
  typeof DialogPrimitive.Root
>;

export const EditorSettingsModal = ({
  children,
  ...props
}: EditorSettingsModalProps) => {
  return (
    <DialogPrimitive.Root {...props}>
      <DialogPrimitive.Portal>
        <StyledOverlay />
        <StyledContent>{children}</StyledContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
