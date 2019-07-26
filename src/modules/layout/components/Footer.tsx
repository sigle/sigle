import React from 'react';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { Container } from '../../../components';

const StyledContainer = styled(Container)`
  ${tw`mt-8 py-8 text-right border-t border-solid border-grey-light`};

  a {
    ${tw`mr-4`};
  }
  a:last-child {
    ${tw`mr-0`};
  }
`;

const StyledLink = styled.a`
  ${tw`text-sm text-black no-underline`};
  :hover {
    ${tw`underline`};
  }
`;

export const Footer = () => {
  return (
    <StyledContainer>
      <StyledLink
        href="https://app-center.openintents.org/appco/1092/review"
        target="_blank"
        rel="noopener,noreferrer"
      >
        Rate app!
      </StyledLink>
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
    </StyledContainer>
  );
};
