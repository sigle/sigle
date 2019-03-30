import React from 'react';
import {
  Button as RebassButton,
  ButtonProps as RebassButtonProps,
} from 'rebass';

interface ButtonProps extends RebassButtonProps {
  variant?: 'primary' | 'outline';
}

export const Button = (props: ButtonProps) => (
  <RebassButton
    css={{
      cursor: 'pointer',
    }}
    variant="default"
    {...props}
  />
);
