import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { darkTheme, keyframes, styled } from '../stitches.config';

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

const StyledContent = styled(HoverCardPrimitive.Content, {
  borderRadius: '$3',
  p: '$5',
  backgroundColor: '$gray1',
  color: '$gray11',
  zIndex: 1,
  boxShadow:
    '0px 8px 20px rgba(8, 8, 8, 0.06), 0px 10px 18px rgba(8, 8, 8, 0.04), 0px 5px 14px rgba(8, 8, 8, 0.04), 0px 3px 8px rgba(8, 8, 8, 0.04), 0px 1px 5px rgba(8, 8, 8, 0.03), 0px 1px 2px rgba(8, 8, 8, 0.02), 0px 0.2px 1px rgba(8, 8, 8, 0.01)',

  [`.${darkTheme} &`]: {
    boxShadow:
      '0px 8px 20px rgba(8, 8, 8, 0.32), 0px 10px 18px rgba(8, 8, 8, 0.28), 0px 5px 14px rgba(8, 8, 8, 0.26), 0px 3px 8px rgba(8, 8, 8, 0.16), 0px 1px 5px rgba(8, 8, 8, 0.14), 0px 1px 2px rgba(8, 8, 8, 0.12), 0px 0.2px 1px rgba(8, 8, 8, 0.08)',
  },

  '&:hover': {
    color: '$orange11',
  },

  '@media (prefers-reduced-motion: no-preference)': {
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    animationFillMode: 'forwards',
    willChange: 'transform, opacity',
    '&[data-state="open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
});

const StyledArrow = styled(HoverCardPrimitive.Arrow, {
  fill: '$gray3',
});

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;
export const HoverCardContent = StyledContent;
export const HoverCardArrow = StyledArrow;
