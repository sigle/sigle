import React from 'react';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { Container } from '../../../components';

const StyledContainer = styled.div`
  ${tw`mt-8 py-8 bg-grey-light text-right`};

  a {
    ${tw`mr-4`};
  }
  a:last-child {
    ${tw`mr-0`};
  }
`;

const StyledLink = styled.a`
  ${tw`text-black no-underline`};
  :hover {
    ${tw`underline`};
  }
`;

export const Footer = () => {
  return (
    <StyledContainer>
      <Container>
        <StyledLink
          href="https://app.sigle.io/sigleapp.id.blockstack"
          target="_blank"
        >
          Starter guide
        </StyledLink>
        <StyledLink href="https://twitter.com/sigleapp" target="_blank">
          Twitter
        </StyledLink>
        <StyledLink href="https://github.com/pradel/sigle" target="_blank">
          GitHub
        </StyledLink>
      </Container>
    </StyledContainer>
  );
};
