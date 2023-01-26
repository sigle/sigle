import { CSS, styled } from '@sigle/stitches.config';
import { forwardRef } from 'react';

const InputContainer = styled('div', {
  position: 'relative',
});

const StyledInput = styled('input', {
  color: '$gray11',
  border: '1px solid $gray8',
  backgroundColor: '$gray1',
  borderRadius: '$sm',
  fontSize: '$sm',
  lineHeight: '$sm',
  py: '$2',
  px: '$3',
  width: '100%',
  outline: 'none',
  transition: 'all 75ms $ease-in',

  '::placeholder': {
    color: '$gray8',
  },
  '&:hover': {
    border: '1px solid $gray9',
  },
  '&:focus': {
    border: '1px solid $indigo8',
    boxShadow: '0px 0px 0px 3px rgba(145, 139, 255, 0.3)',
  },
  '&:disabled': {
    pointerEvents: 'none',
    backgroundColor: '$gray3',
    border: '1px solid $gray6',
  },

  variants: {
    invalid: {
      true: {
        border: '1px solid $orange8',
        '&:hover': {
          border: '1px solid $orange9',
        },
        '&:focus': {
          border: '1px solid $orange8',
          boxShadow: '0px 0px 0px 3px rgba(255, 152, 115, 0.3)',
        },
      },
    },
    hasIcon: {
      true: {
        pr: '$8',
      },
    },
  },
});

const StyledRightIcon = styled('div', {
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  top: 0,
  bottom: 0,
  right: 0,
  pointerEvents: 'none',
  px: '$2',
});

type StyledInputPrimitiveProps = React.ComponentProps<typeof StyledInput>;
type StyledInputProps = StyledInputPrimitiveProps & { css?: CSS };
export type InputProps = Omit<StyledInputProps, 'hasIcon'> & {
  rightIcon?: React.ReactNode;
};

export const Input = forwardRef<
  React.ElementRef<typeof StyledInput>,
  InputProps
>(({ children, rightIcon, ...props }, forwardedRef) => (
  <InputContainer>
    <>
      <StyledInput hasIcon={!!rightIcon} {...props} ref={forwardedRef} />
      {rightIcon && <StyledRightIcon>{rightIcon}</StyledRightIcon>}
    </>
  </InputContainer>
));

Input.displayName = 'Input';
