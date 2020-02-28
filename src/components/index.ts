import styled, { css } from 'styled-components';
import tw from 'twin.macro';

// TODO max width media-queries
export const Container = styled.div`
  ${tw`mx-auto px-4`};

  width: 100%;
  max-width: 992px;
`;

export const Button = styled.button<{ href?: string; target?: string }>`
  ${tw`bg-pink text-white py-2 px-8 rounded no-underline cursor-pointer transition-colors duration-200 ease-in-out`};

  &:hover {
    background-color: #db3159;
  }
`;

export const ButtonOutline = styled.button<{ size?: 'large' }>`
  ${tw`py-1 px-2 rounded text-sm text-pink border border-solid border-pink no-underline cursor-pointer`};

  &:hover {
    ${tw`bg-pink text-white`};
  }

  ${props =>
    props.disabled &&
    css`
      ${tw`border-grey-dark text-grey-dark`};

      &:hover {
        ${tw`bg-transparent border-grey-dark text-grey-dark`};
      }
    `}

  ${props =>
    props.size === 'large' &&
    css`
      ${tw`py-2 px-8 text-base`};
    `}
`;

export { FullScreenDialog } from './FullScreenDialog';
