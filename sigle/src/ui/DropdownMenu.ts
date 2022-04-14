import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { keyframes, styled } from '../stitches.config';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuSeparator = styled(DropdownMenuPrimitive.Separator, {
  height: 1,
  mx: '-$3',
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
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  p: '$3',
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
  py: '$2',
  pl: '$2',
  pr: '$5',
  br: '$1',
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',

  variants: {
    color: {
      gray: {
        color: '$gray9',

        '&:hover': {
          color: '$gray11',
          backgroundColor: '$gray4',
        },

        '&:active': {
          color: '$gray11',
          backgroundColor: '$gray5',
        },

        '&:focus': {
          outline: 'none',
          backgroundColor: '$gray5',
          color: '$gray11',
        },
      },
      red: {
        color: '$red11',

        '&:hover': {
          color: '$red11',
          backgroundColor: '$red4',
        },

        '&:active': {
          color: '$red11',
          backgroundColor: '$red5',
        },

        '&:focus': {
          outline: 'none',
          backgroundColor: '$red5',
          color: '$red11',
        },
      },
    },
  },

  defaultVariants: {
    color: 'gray',
  },
});
