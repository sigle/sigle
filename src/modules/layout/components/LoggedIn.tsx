import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import Link from 'next/link';
import { MdRemoveRedEye } from 'react-icons/md';
import { userSession } from '../../../utils/blockstack';
import { AppBar, AppBarRightContainer } from './AppBar';
import { BlockstackUser } from '../../../types';

const Container = styled.div`
  ${tw`w-full h-screen flex`}
  display: grid;
  grid-template-columns: minmax(252px, calc((100% - 1262px) / 2 + 226px)) 1fr;
`;

const Sidebar = styled.div`
  ${tw`bg-grey-light flex flex-col items-end`}
`;

const SidebarContent = styled.div`
  ${tw`flex flex-col justify-between w-64 h-full`}
`;

const Content = styled.div`
  ${tw`mx-16`}
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

const MenuItem = styled.li<{ active: boolean }>`
  a {
    ${tw`py-2 px-3 block rounded text-grey-darker mt-2`}
  }
  a:hover {
    ${tw`bg-grey`}
  }
  ${props =>
    props.active &&
    css`
      a {
        ${tw`bg-grey`}
      }
    `}
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
    ${tw`mt-2 font-normal cursor-pointer`}
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<BlockstackUser | null>(null);

  // TODO move this to some auth context
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
      <Sidebar>
        <SidebarContent>
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
              <MenuItem active={router.route === '/'}>
                <Link href="/" passHref>
                  <a>Drafts</a>
                </Link>
              </MenuItem>
              <MenuItem active={router.route === '/published'}>
                <Link href="/published" passHref>
                  <a>Published</a>
                </Link>
              </MenuItem>
            </Menu>
          </div>
          <div>
            <MenuBottom>
              <MenuBottomItem>
                <a href="https://app.sigle.io/sigleapp.id.blockstack">Blog</a>
              </MenuBottomItem>
              <MenuBottomItem>
                <Link href="/help" passHref>
                  <a>Help</a>
                </Link>
              </MenuBottomItem>
              <MenuBottomItem>
                <a href="https://github.com/pradel/sigle/blob/master/CHANGELOG.md">
                  Changelog
                </a>
              </MenuBottomItem>
              <MenuBottomItem>
                <a className="logout" onClick={handleLogout}>
                  Logout
                </a>
              </MenuBottomItem>
            </MenuBottom>
            <Link href="/support-us" passHref>
              <SupportButton>Support us</SupportButton>
            </Link>
          </div>
        </SidebarContent>
      </Sidebar>
      <Content>{children}</Content>
    </Container>
  );
};
