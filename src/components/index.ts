import styled from 'styled-components';
import tw from 'tailwind.macro';

// TODO max width media-queries
export const Container = styled.div`
  ${tw`mx-auto px-4`};

  width: 100%;
  max-width: 992px;
`;

export const Tabs = styled.div`
  ${tw`flex border-b border-solid border-grey`};
`;

export const Tab = styled.div`
  ${tw`py-2 cursor-pointer mr-6`};

  &:hover {
    ${tw`font-bold`};
  }
  &.active {
    ${tw`font-bold`};
  }
`;

export const Button = styled.button`
  ${tw`bg-pink text-white py-2 px-8 rounded-full no-underline cursor-pointer`};
`;

export const ButtonOutline = styled.button`
  ${tw`py-1 px-2 rounded-lg text-sm text-pink border border-solid border-pink no-underline cursor-pointer`};

  &:hover {
    ${tw`bg-pink text-white`};
  }
`;
