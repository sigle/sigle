import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { MdSort } from 'react-icons/md';
import { getConfig } from 'radiks';
import { Container, Button, Link } from '../../../components';
import { MobileMenu } from './MobileMenu';
import { UserContext } from '../../../context/UserContext';

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

const HeaderUser = styled.div`
  ${tw`relative cursor-pointer`};
`;

const HeaderUserPhoto = styled.img`
  ${tw`w-8 h-8 rounded-full`};
`;

const HeaderDropdown = styled.div`
  ${tw`origin-top-right absolute right-0 mt-2 w-32 bg-white rounded-lg border shadow-md py-2`};
  transform-origin: top right;

  a {
    ${tw`block px-4 py-2 hover:bg-black hover:text-white lg:text-sm`};
  }
`;

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [menuUserOpen, setMenuUserOpen] = useState<boolean>(false);
  const { user } = useContext(UserContext);

  const handleLogin = () => {
    const { userSession } = getConfig();
    userSession.redirectToSignIn();
  };

  const handleLogout = () => {
    const { userSession } = getConfig();
    userSession.signUserOut();
    // TODO reload the page
  };

  return (
    <Container>
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
      />
      <HeaderContainer>
        <HeaderIcon size={30} onClick={() => setMenuOpen(true)} />

        <Link href="/">
          <HeaderLogo src="/static/images/logo.png" alt="Sigle logo" />
        </Link>

        <HeaderSeparator />

        <HeaderLink href="/discover">Discover</HeaderLink>
        <HeaderLink href="/b">How to use?</HeaderLink>
        {!user && (
          <HeaderButton color="black" onClick={handleLogin}>
            Sign in
          </HeaderButton>
        )}

        {user && (
          <HeaderUser onClick={() => setMenuUserOpen(!menuUserOpen)}>
            <HeaderUserPhoto src="https://source.unsplash.com/random/100x100" />
            {menuUserOpen && (
              <HeaderDropdown>
                <ul>
                  <li>
                    <Link href="/me">My stories</Link>
                  </li>
                  <li>
                    <Link href="/settings">Settings</Link>
                  </li>
                  <li>
                    <a onClick={handleLogout}>Sign out</a>
                  </li>
                </ul>
              </HeaderDropdown>
            )}
          </HeaderUser>
        )}
      </HeaderContainer>
    </Container>
  );
};
