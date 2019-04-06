import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Container, Button, Link } from '../../../components';

const HeaderContainer = styled.div<{}>`
  ${tw`py-3 flex items-center`};
`;

const HeaderLogo = styled.img`
  height: 30px;
`;

const HeaderSeparator = styled.img`
  ${tw`mx-auto`};
`;

const HeaderLink = styled(Link)`
  ${tw`py-3 px-3 block lg:text-sm hover:underline`};
`;

const HeaderButton = styled(Button)`
  ${tw`ml-3`};
`;

export const Header = () => (
  <Container>
    <HeaderContainer>
      <Link href="/">
        <HeaderLogo src="/static/images/logo.png" alt="Sigle logo" />
      </Link>

      <HeaderSeparator />

      <HeaderLink href="/discover">Discover</HeaderLink>
      <HeaderLink href="/b">How to use?</HeaderLink>
      <HeaderLink href="/c">Contact</HeaderLink>
      <HeaderButton color="black">Sign in</HeaderButton>
    </HeaderContainer>
  </Container>
);
