import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { keyframes, styled } from '../stitches.config';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuSeparator = styled(DropdownMenuPrimitive.Separator, {
  height: 1,
  backgroundColor: '$gray6',
});

const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideRightAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideLeftAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

export const DropdownMenuContent = styled(DropdownMenuPrimitive.Content, {
  minWidth: 80,
  backgroundColor: '$gray1',
  br: '$1',
  border: '1px solid $gray6',
  overflow: 'hidden',
  '@media (prefers-reduced-motion: no-preference)': {
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform, opacity',
    '&[data-state="open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
});

export const DropdownMenuItem = styled(DropdownMenuPrimitive.Item, {
  unset: 'all',
  fontSize: '$2',
  lineHeight: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  whiteSpace: 'nowrap',
  py: '$3',
  px: '$4',
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',
  color: '$gray9',

  '&:hover': {
    color: '$gray11',
  },
  '&:focus': {
    outline: 'none',
    color: '$gray11',
  },
});
