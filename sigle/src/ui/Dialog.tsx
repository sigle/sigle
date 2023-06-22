import { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross1Icon } from '@radix-ui/react-icons';
import { CSS, darkTheme, keyframes, styled } from '../stitches.config';
import { IconButton } from './IconButton';

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

export const StyledOverlay = styled(DialogPrimitive.Overlay, {
  backgroundColor: 'rgba(8, 8, 8, 0.7)',
  position: 'fixed',
  inset: 0,

  [`.${darkTheme} &`]: {
    backgroundColor: 'rgba(46, 46, 46, 0.7)',
  },

  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
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

const StyledContent = styled(DialogPrimitive.Content, {
  backgroundColor: '$gray1',
  color: '$gray11',
  br: '$2',
  boxShadow: '0px 0px 33px rgba(0, 0, 0, 0.08)',
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
  px: '$6',
  pt: 48,
  pb: '$5',
  overflow: 'scroll',
  transform: 'none',

  '@md': {
    maxHeight: '85vh',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',

    '@media (prefers-reduced-motion: no-preference)': {
      animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    },
  },

  '&:focus': { outline: 'none' },
});

const StyledCloseButton = styled(DialogPrimitive.Close, {
  position: 'absolute',
  top: '$4',
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
        <IconButton size="sm">
          <Cross1Icon width={15} height={15} />
        </IconButton>
      </StyledCloseButton>
    )}
  </StyledContent>
));

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
