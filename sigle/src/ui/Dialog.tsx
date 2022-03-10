import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross1Icon } from '@radix-ui/react-icons';
import { CSS, keyframes, styled } from '../stitches.config';
import { IconButton } from './IconButton';

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const StyledOverlay = styled(DialogPrimitive.Overlay, {
  backgroundColor: '$gray5',
  opacity: 0.7,
  position: 'fixed',
  inset: 0,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
});

type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root> & {
  children: React.ReactNode;
};

export function Dialog({ children, ...props }: DialogProps) {
  return (
    <DialogPrimitive.Root {...props}>
      <StyledOverlay />
      {children}
    </DialogPrimitive.Root>
  );
}

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

const StyledContent = styled(DialogPrimitive.Content, {
  backgroundColor: 'white',
  br: '$2',
  boxShadow: '0px 0px 33px rgba(0, 0, 0, 0.08)',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '550px',
  maxHeight: '85vh',
  px: '$6',
  pt: 48,
  pb: '$5',
  overflow: 'scroll',
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    willChange: 'transform',
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
> & { css?: CSS };

export function DialogContent({ children, ...props }: DialogContentProps) {
  return (
    <StyledContent {...props}>
      {children}
      <StyledCloseButton asChild>
        <IconButton>
          <Cross1Icon width={15} height={15} />
        </IconButton>
      </StyledCloseButton>
    </StyledContent>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
