import styled from 'styled-components';
import tw from 'twin.macro';

// TODO max width media-queries
export const Container = styled.div`
  ${tw`mx-auto px-4`};

  width: 100%;
  max-width: 992px;
`;
