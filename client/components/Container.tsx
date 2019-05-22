import styled from 'styled-components';
import tw from 'tailwind.macro';

// TODO see why container class is not working

export const Container = styled.div<{}>`
  ${tw`mx-auto px-4`};
  max-width: 1024px;
`;
