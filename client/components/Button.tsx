import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';

interface ButtonProps {
  color?: 'black' | 'primary';
  variant?: 'outline';
  size?: 'large';
}

export const Button = styled.button<ButtonProps>`
  ${tw`font-bold py-1 px-4 text-black lg:text-sm`};
  border-radius: 0.6rem;

  ${props =>
    props.color &&
    props.color === 'black' &&
    css`
      ${tw`bg-black text-white`};
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

  ${props =>
    props.size === 'large' &&
    css`
      ${tw`py-2`};
    `}
`;
