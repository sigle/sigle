import { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { TbX } from 'react-icons/tb';
import { CSS, darkTheme, keyframes, styled } from '../stitches.config';
import { IconButton } from './IconButton';

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 0.7 },
});

const overlayHide = keyframes({
  '0%': { opacity: 0.7 },
  '100%': { opacity: 0 },
});

export const StyledOverlay = styled(DialogPrimitive.Overlay, {
  position: 'fixed',
  inset: 0,
  backgroundColor: '$gray5',
  opacity: 0.7,

  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': {
      animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    },
    '&[data-state="closed"]': {
      animation: `${overlayHide} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    },
  },
});

type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root> & {
  children: React.ReactNode;
  overlay?: boolean;
};

export function Dialog({ children, overlay = true, ...props }: DialogProps) {
  return (
    <DialogPrimitive.Root {...props}>
      <DialogPrimitive.Portal>
        {overlay && <StyledOverlay />}
        {children}
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

const contentHide = keyframes({
  '0%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
  '100%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
});

const StyledContent = styled(DialogPrimitive.Content, {
  backgroundColor: '$gray1',
  color: '$gray11',
  br: '$sm',
  boxShadow: '0px 12px 12px -6px rgba(0, 0, 0, 0.16)',
  position: 'fixed',
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  mx: 'auto',
  my: 'auto',
  width: '90vw',
  maxWidth: '550px',
  maxHeight: 'max-content',
  py: '$4',
  px: '$5',
  overflow: 'scroll',
  transform: 'none',

  [`.${darkTheme} &`]: {
    boxShadow: '0px 12px 12px -6px rgba(0, 0, 0, 0.64)',
  },

  '@md': {
    maxHeight: '85vh',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',

    '@media (prefers-reduced-motion: no-preference)': {
      '&[data-state="open"]': {
        animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
      },
      '&[data-state="closed"]': {
        animation: `${contentHide} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
      },
    },
  },

  '&:focus': { outline: 'none' },
});

const StyledCloseButton = styled(DialogPrimitive.Close, {
  position: 'absolute',
  top: '$3',
  right: '$6',
});

type DialogContentProps = React.ComponentProps<
  typeof DialogPrimitive.Content
> & { css?: CSS; closeButton?: boolean };

export const DialogContent = forwardRef<
  React.ElementRef<typeof StyledContent>,
  DialogContentProps
>(({ children, closeButton = true, ...props }, forwardedRef) => (
  <StyledContent {...props} ref={forwardedRef}>
    {children}
    {closeButton && (
      <StyledCloseButton asChild>
        <IconButton size="sm" variant="ghost">
          <TbX size={16} />
        </IconButton>
      </StyledCloseButton>
    )}
  </StyledContent>
));

DialogContent.displayName = 'DialogContent';

export const DialogDivider = styled('div', {
  height: '1px',
  my: '$4',
  mx: '-$5',
  backgroundColor: '$gray6',
});

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
