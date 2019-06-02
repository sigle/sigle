import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';

export const Tabs = styled.div`
  ${tw`flex`};
`;

export const Tab = styled.div<{ active: boolean }>`
  ${tw`cursor-pointer pb-1`};
  &:first-child {
    ${tw`mr-8`};
  }

  ${props =>
    props.active &&
    css`
      ${tw`border-b border-solid border-black font-medium`};
    `}
`;
