import styled from 'styled-components';
import tw from 'tailwind.macro';

// TODO see why container class is not working

export const Container = styled.div`
  ${tw`mx-auto px-4`};
  max-width: 1024px;
  width: 100%;
`;

export const FullHeightContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const MinHeightContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
