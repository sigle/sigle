import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import {
  Button as RebassButton,
  ButtonProps as RebassButtonProps,
} from 'rebass';

interface ButtonProps {
  color?: 'primary';
  variant?: 'outline';
}

export const StyledButton = styled.button<ButtonProps>`
  ${tw`bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded`};
`;

export const Button = (props: ButtonProps) => (
  <RebassButton
    css={{
      cursor: 'pointer',
    }}
    variant="default"
    {...props}
  />
);
