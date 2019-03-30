import React from 'react';
import { Button as RebassButton } from 'rebass';

interface Props {
  variant?: 'primary' | 'outline';
  children: React.ReactNode;
}

export const Button = (props: Props) => (
  <RebassButton
    css={{
      cursor: 'pointer',
    }}
    {...props}
    variant={props.variant || 'default'}
  />
);
