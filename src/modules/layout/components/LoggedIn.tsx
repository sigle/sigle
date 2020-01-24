import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import Link from 'next/link';
import Tippy from '@tippy.js/react';
import { MdRemoveRedEye } from 'react-icons/md';
import { userSession } from '../../../utils/blockstack';
import { AppBar, AppBarRightContainer } from './AppBar';
import { BlockstackUser } from '../../../types';
import { config } from '../../../config';

const Logout = styled.div`
  ${tw`font-semibold cursor-pointer`}
`;

const Container = styled.div`
  ${tw`w-full h-screen flex`}
`;

const Column = styled.div`
  ${tw`bg-grey-light flex flex-col justify-between w-64`}
  flex: 0 0 auto;
  /* padding-left: calc((100% - ${config.breakpoints.lg}px) / 2); */
`;

const Content = styled.div`
  ${tw`mx-16`}
  flex: 1 1 auto;
  max-width: 750px;
`;

const LogoContainer = styled.a`
  ${tw`py-8 flex items-center justify-center`};
`;

const Logo = styled.img`
  height: 55px;
`;

const Name = styled.a`
  ${tw`py-3 flex items-center justify-center bg-black text-white`};
`;

const Menu = styled.ul`
  ${tw`mt-6 list-none px-3`}
`;

const MenuItem = styled.li`
  a {
    ${tw`py-2 px-3 block rounded text-grey-darker mt-2`}
  }
  a:hover {
    ${tw`bg-grey`}
  }
`;

const MenuBottom = styled.ul`
  ${tw`list-none px-3`}
`;

const MenuBottomItem = styled.li`
  a {
    ${tw`py-2 px-3 block rounded text-sm text-grey-darker font-light`}
  }
  a:hover {
    ${tw`bg-grey`}
  }
  .logout {
    ${tw`mt-2 font-normal`}
  }
`;

const SupportButton = styled.a`
  ${tw`py-2 pr-2 pl-6 mt-4 flex items-center justify-start bg-pink text-white`};
`;

interface Props {
  showAppBar?: boolean;
  children: React.ReactNode;
}

export const LoggedIn = ({ children, showAppBar = true }: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<BlockstackUser | null>(null);

  const loadUserData = async () => {
    try {
      const user: BlockstackUser = await userSession.loadUserData();
      setUser(user);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleLogout = () => {
    userSession.signUserOut();
    window.location.replace(window.location.origin);
  };

  // TODO style it
  if (loading) {
    return <div>Loading ...</div>;
  }

  // TODO style it
  if (error) {
    return <div>{error}</div>;
  }

  // TODO style it
  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <Container>
      <Column>
        <div>
          <Link href="/" passHref>
            <LogoContainer>
              <Logo src="/img/logo.png" alt="logo" />
            </LogoContainer>
          </Link>
          <Name href={`/${user.username}`} target="_blank">
            Visit my blog
            <MdRemoveRedEye size={18} style={{ marginLeft: 8 }} />
          </Name>
          <Menu>
            <MenuItem>
              <Link href="/" passHref>
                <a>Drafts</a>
              </Link>
            </MenuItem>
            <MenuItem>
              <Link href="/" passHref>
                <a>Published</a>
              </Link>
            </MenuItem>
          </Menu>
        </div>
        <div>
          <MenuBottom>
            <MenuBottomItem>
              <Link href="/" passHref>
                <a>Blog</a>
              </Link>
            </MenuBottomItem>
            <MenuBottomItem>
              <Link href="/" passHref>
                <a>Help</a>
              </Link>
            </MenuBottomItem>
            <MenuBottomItem>
              <Link href="/" passHref>
                <a>Changelog</a>
              </Link>
            </MenuBottomItem>
            <MenuBottomItem>
              <Link href="/" passHref>
                <a className="logout">Logout</a>
              </Link>
            </MenuBottomItem>
          </MenuBottom>
          <Link href="/support-us" passHref>
            <SupportButton>Support us</SupportButton>
          </Link>
        </div>
      </Column>
      <Content>{children}</Content>
    </Container>
  );

  // return (
  //   <React.Fragment>
  //     {showAppBar && (
  //       <AppBar>
  //         <AppBarRightContainer>
  //           <Tippy content={user.username} theme="light-border">
  //             <Name href={`/${user.username}`} target="_blank">
  //               <IoIosEye size={22} style={{ marginRight: 6 }} /> Visit my blog
  //             </Name>
  //           </Tippy>
  //           <Logout onClick={handleLogout}>Logout</Logout>
  //         </AppBarRightContainer>
  //       </AppBar>
  //     )}

  //     {children}
  //   </React.Fragment>
  // );
};
