import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { keyframes, styled } from '../stitches.config';

export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogTitle = AlertDialogPrimitive.Title;
export const AlertDialogDescription = AlertDialogPrimitive.Description;
export const AlertDialogAction = AlertDialogPrimitive.Action;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const StyledOverlay = styled(AlertDialogPrimitive.Overlay, {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, .15)',
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
});

type AlertDialogProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Root
> & {
  children: React.ReactNode;
};

export function AlertDialog({ children, ...props }: AlertDialogProps) {
  return (
    <AlertDialogPrimitive.Root {...props}>
      <StyledOverlay />
      {children}
    </AlertDialogPrimitive.Root>
  );
}

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

export const AlertDialogContent = styled(AlertDialogPrimitive.Content, {
  backgroundColor: 'white',
  borderRadius: 6,
  boxShadow:
    'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '500px',
  maxHeight: '85vh',
  padding: 25,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    willChange: 'transform',
  },
  '&:focus': { outline: 'none' },
});
