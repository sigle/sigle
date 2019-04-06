import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';

interface ButtonProps {
  color?: 'black' | 'primary';
  variant?: 'outline';
}

export const Button = styled.button<ButtonProps>`
  ${tw`font-bold py-2 px-4 rounded text-black`};

  ${props =>
    props.color &&
    props.color === 'black' &&
    css`
      ${tw`bg-black hover:bg-gray-800 text-white`};
    `}

  ${props =>
    props.color &&
    props.color === 'primary' &&
    css`
      ${tw`bg-primary text-white`};
    `}

  ${props =>
    props.variant &&
    props.variant === 'outline' &&
    css`
      ${tw`bg-transparent font-medium border border-black`};
    `}
`;
