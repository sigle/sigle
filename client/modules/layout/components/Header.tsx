import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import Router from 'next/router';
import { MdSort } from 'react-icons/md';
import { getConfig } from 'radiks';
import {
  Container,
  Button,
  Link,
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
} from '../../../components';
import { MobileMenu } from './MobileMenu';
import { UserContext } from '../../../context/UserContext';
import { PrivateStory } from '../../../models';
import { defaultUserImage } from '../../../utils';
import { SignInDialog } from '../../dialog/SignInDialog';

const HeaderShadow = styled.div`
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.03),
    0 4px 6px -2px rgba(0, 0, 0, 0.03);
`;

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

// TODO nice underline with more space
const HeaderLink = styled(Link)`
  ${tw`py-3 px-3 block lg:text-sm hover:underline hidden lg:block`};
`;

const HeaderButton = styled(Button)`
  ${tw`ml-3`};
`;

const HeaderButtonNewStory = styled(Button)`
  ${tw`ml-3 mr-4`};
`;

const HeaderUserPhoto = styled.img`
  ${tw`w-8 h-8 rounded-full`};
`;

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
  const { user, sigleUser, loading } = useContext(UserContext);

  const handleLogout = () => {
    const { userSession } = getConfig();
    userSession.signUserOut();
    window.location.href = '/discover';
  };

  const handleNewStory = async () => {
    const privateStory = new PrivateStory({
      title: '',
      content: '',
    });
    await privateStory.save();
    Router.push(
      {
        pathname: '/editor',
        query: {
          storyId: privateStory._id,
          storyType: 'private',
        },
        // Next.js types are wrong for this function
      } as any,
      `/me/stories/drafts/${privateStory._id}`
    );
  };

  const userImage = sigleUser
    ? sigleUser.attrs.imageUrl
      ? sigleUser.attrs.imageUrl
      : defaultUserImage(sigleUser.attrs.username, 32)
    : undefined;

  return (
    <HeaderShadow>
      <Container>
        <MobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onLogin={() => setLoginOpen(true)}
          user={user}
          userImage={userImage}
        />
        <HeaderContainer>
          <SignInDialog open={loginOpen} onClose={() => setLoginOpen(false)} />

          <HeaderIcon size={30} onClick={() => setMenuOpen(true)} />

          <Link href="/">
            <HeaderLogo src="/static/images/logo.png" alt="Sigle logo" />
          </Link>

          <HeaderSeparator />
          <HeaderLink
            href="https://app-center.openintents.org/appco/1092/review"
            rel="noopener noreferrer"
          >
            Rate App!
          </HeaderLink>
          <HeaderLink href="/discover">Discover</HeaderLink>
          {/* TODO how to use */}
          {/* <HeaderLink href="/b">How to use?</HeaderLink> */}
          {/* TODO nice loading */}
          {loading && <div>Loading ...</div>}

          {!loading && !user && (
            <HeaderButton color="black" onClick={() => setLoginOpen(true)}>
              Sign in
            </HeaderButton>
          )}

          {!loading && user && (
            <HeaderButtonNewStory color="primary" onClick={handleNewStory}>
              New story
            </HeaderButtonNewStory>
          )}

          {!loading && user && (
            <Menu>
              <MenuButton>
                <HeaderUserPhoto src={userImage} alt={user.username} />
              </MenuButton>
              <MenuList>
                <MenuItem onSelect={() => Router.push('/me')}>
                  My stories
                </MenuItem>
                <MenuItem
                  onSelect={() =>
                    Router.push(
                      {
                        pathname: '/profile',
                        query: {
                          username: user.username,
                        },
                        // Next.js types are wrong for this function
                      } as any,
                      `/@${user.username}`
                    )
                  }
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onSelect={() => Router.push('/settings', '/me/settings')}
                >
                  Settings
                </MenuItem>
                <MenuItem onSelect={handleLogout}>Sign out</MenuItem>
              </MenuList>
            </Menu>
          )}
        </HeaderContainer>
      </Container>
    </HeaderShadow>
  );
};
