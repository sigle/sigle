import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import Link from 'next/link';
import Tippy from '@tippy.js/react';
import { MdPanoramaFishEye } from 'react-icons/md';
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

const columnWidth = 290;

const Column = styled.div`
  ${tw`bg-grey`}
  flex: 0 0 auto;
  min-width: ${columnWidth}px;
  /* padding-left: calc((100% - ${config.breakpoints.lg}px) / 2); */
`;

const Content = styled.div`
  flex: 1 1 auto;
`;

const LogoContainer = styled.a`
  ${tw`py-8 flex items-center justify-center`};
`;

const Logo = styled.img`
  height: 40px;
`;

const Name = styled.a`
  ${tw`py-4 flex items-center justify-center bg-black text-white`};
`;

const Menu = styled.ul`
  ${tw`mt-8 list-none`}
`;

const MenuItem = styled.li`
  a {
    ${tw`py-4 pl-4 block rounded-l-full`}
  }
  a:hover {
    ${tw`bg-white`}
  }
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
        <Link href="/" passHref>
          <LogoContainer>
            <Logo src="/img/logo.png" alt="logo" />
          </LogoContainer>
        </Link>
        <Name href={`/${user.username}`} target="_blank">
          Visit my blog
          <MdPanoramaFishEye size={22} style={{ marginLeft: 6 }} />
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
