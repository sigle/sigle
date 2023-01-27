import Link from 'next/link';
import { forwardRef } from 'react';
import { CSS, styled } from '@sigle/stitches.config';

const StyledButton = styled('button', {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '$sm',
  lineHeight: '$sm',
  fontWeight: 600,
  br: '$sm',

  '&:disabled': {
    pointerEvents: 'none',
  },

  defaultVariants: {
    size: 'md',
    variant: 'solid',
    color: 'gray',
    hasIcon: 'none',
  },

  variants: {
    size: {
      sm: {
        py: '6px',
        px: '$3',
      },
      md: {
        py: '$2',
        px: '$4',
      },
      lg: {
        py: '10px',
        px: '$5',
      },
    },
    variant: {
      solid: {
        color: '$gray1',
        backgroundColor: '$gray11',
        '&:hover': {
          backgroundColor: '$gray12',
        },
        '&:active': {
          backgroundColor: '$gray10',
        },
        '&:disabled': {
          backgroundColor: '$gray7',
        },
      },
      light: {
        color: '$gray11',
        backgroundColor: '$gray3',
        '&:hover': {
          color: '$gray12',
          backgroundColor: '$gray5',
        },
        '&:active': {
          color: '$gray10',
          backgroundColor: '$gray4',
        },
        '&:disabled': {
          color: '$gray9',
          backgroundColor: '$gray3',
        },
      },
      outline: {
        color: '$gray11',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '$gray11',
        '&:hover': {
          color: '$gray12',
          backgroundColor: '$gray5',
          borderColor: '$gray12',
        },
        '&:active': {
          color: '$gray10',
          backgroundColor: '$gray4',
          borderColor: '$gray10',
        },
        '&:disabled': {
          color: '$gray7',
          borderColor: '$gray7',
        },
      },
      ghost: {
        color: '$gray11',
        '&:hover': {
          color: '$gray12',
          backgroundColor: '$gray5',
        },
        '&:active': {
          color: '$gray10',
          backgroundColor: '$gray4',
        },
        '&:disabled': {
          color: '$gray9',
        },
      },
    },
    color: {
      gray: {},
      indigo: {},
    },
    hasIcon: {
      none: {},
      left: {},
      right: {},
    },
  },
  compoundVariants: [
    {
      variant: 'solid',
      color: 'indigo',
      css: {
        backgroundColor: '$indigo11',
        '&:hover': {
          backgroundColor: '$indigo12',
        },
        '&:active': {
          backgroundColor: '$indigo10',
        },
        '&:disabled': {
          backgroundColor: '$indigo7',
        },
      },
    },
    {
      variant: 'light',
      color: 'indigo',
      css: {
        color: '$indigo11',
        backgroundColor: '$indigo3',
        '&:hover': {
          color: '$indigo12',
          backgroundColor: '$indigo5',
        },
        '&:active': {
          color: '$indigo10',
          backgroundColor: '$indigo4',
        },
        '&:disabled': {
          color: '$indigo6',
          backgroundColor: '$indigo3',
        },
      },
    },
    {
      variant: 'outline',
      color: 'indigo',
      css: {
        color: '$indigo11',
        borderColor: '$indigo11',
        '&:hover': {
          color: '$indigo12',
          backgroundColor: '$indigo5',
          borderColor: '$indigo12',
        },
        '&:active': {
          color: '$indigo10',
          backgroundColor: '$indigo4',
          borderColor: '$indigo10',
        },
        '&:disabled': {
          color: '$indigo7',
          borderColor: '$indigo7',
        },
      },
    },
    {
      variant: 'ghost',
      color: 'indigo',
      css: {
        color: '$indigo11',
        '&:hover': {
          color: '$indigo12',
          backgroundColor: '$indigo5',
        },
        '&:active': {
          color: '$indigo10',
          backgroundColor: '$indigo4',
        },
        '&:disabled': {
          color: '$indigo9',
        },
      },
    },
    {
      hasIcon: 'left',
      size: 'sm',
      css: {
        pl: '$2',
      },
    },
    {
      hasIcon: 'left',
      size: 'md',
      css: {
        pl: '10px',
      },
    },
    {
      hasIcon: 'left',
      size: 'lg',
      css: {
        pl: '$3',
      },
    },
    {
      hasIcon: 'right',
      size: 'sm',
      css: {
        pr: '$2',
      },
    },
    {
      hasIcon: 'right',
      size: 'md',
      css: {
        pr: '10px',
      },
    },
    {
      hasIcon: 'right',
      size: 'lg',
      css: {
        pr: '$3',
      },
    },
  ],
});

const StyledLeftIcon = styled('span', {
  mr: '$2',
});

const StyledRightIcon = styled('span', {
  ml: '$2',
});

type StyledButtonPrimitiveProps = React.ComponentProps<typeof StyledButton>;
type StyledButtonProps = StyledButtonPrimitiveProps & { css?: CSS };
export type ButtonProps = Omit<StyledButtonProps, 'hasIcon'> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Button = forwardRef<
  React.ElementRef<typeof StyledButton>,
  ButtonProps
>(({ children, leftIcon, rightIcon, ...props }, forwardedRef) => (
  <StyledButton
    hasIcon={leftIcon ? 'left' : rightIcon ? 'right' : 'none'}
    {...props}
    ref={forwardedRef}
  >
    {leftIcon && <StyledLeftIcon>{leftIcon}</StyledLeftIcon>}
    {children}
    {rightIcon && <StyledRightIcon>{rightIcon}</StyledRightIcon>}
  </StyledButton>
));

Button.displayName = 'Button';
