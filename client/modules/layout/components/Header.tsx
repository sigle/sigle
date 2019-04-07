import React, { useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { MdSort } from 'react-icons/md';
import { getConfig } from 'radiks';
import { Container, Button, Link } from '../../../components';
import { MobileMenu } from './MobileMenu';

const HeaderContainer = styled.div`
  ${tw`py-3 flex items-center`};
`;

const HeaderIcon = styled(MdSort)`
  ${tw`mr-3 lg:hidden cursor-pointer`};
`;

const HeaderLogo = styled.img`
  height: 30px;
`;

const HeaderSeparator = styled.img`
  ${tw`mx-auto`};
`;

const HeaderLink = styled(Link)`
  ${tw`py-3 px-3 block lg:text-sm hover:underline hidden lg:block`};
`;

const HeaderButton = styled(Button)`
  ${tw`ml-3`};
`;

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const handleLogin = () => {
    const { userSession } = getConfig();
    userSession.redirectToSignIn();
  };

  return (
    <Container>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <HeaderContainer>
        <HeaderIcon size={30} onClick={() => setMenuOpen(true)} />

        <Link href="/">
          <HeaderLogo src="/static/images/logo.png" alt="Sigle logo" />
        </Link>

        <HeaderSeparator />

        <HeaderLink href="/discover">Discover</HeaderLink>
        <HeaderLink href="/b">How to use?</HeaderLink>
        <HeaderLink href="/c">Contact</HeaderLink>
        <HeaderButton color="black" onClick={handleLogin}>
          Sign in
        </HeaderButton>
      </HeaderContainer>
    </Container>
  );
};
