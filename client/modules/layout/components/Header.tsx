import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import Router from 'next/router';
import { MdSort } from 'react-icons/md';
import { getConfig } from 'radiks';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  Container,
  Button,
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
import {
  getProfileRoute,
  getSettingsRoute,
  getEditorRoute,
} from '../../../utils/routes';

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
const HeaderLink = styled.a`
  ${tw`py-3 px-3 block lg:text-sm hover:underline hidden lg:block cursor-pointer`};
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
  const [createStoryLoading, setCreateStoryLoading] = useState<boolean>(false);
  const { user, sigleUser, loading } = useContext(UserContext);

  const handleLogout = () => {
    const { userSession } = getConfig();
    userSession.signUserOut();
    window.location.href = '/discover';
  };

  const handleNewStory = async () => {
    setCreateStoryLoading(true);
    try {
      const privateStory = new PrivateStory({
        title: '',
        content: '',
      });
      await privateStory.save();
      const editorRoute = getEditorRoute({
        storyId: privateStory._id,
        radiksType: privateStory.attrs.radiksType,
      });
      Router.push(editorRoute.href, editorRoute.as);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setCreateStoryLoading(false);
    }
  };

  // TODO ask the user via graphql
  const userImage = sigleUser
    ? sigleUser.attrs.imageUrl
      ? sigleUser.attrs.imageUrl
      : // 64 here is used for the mobile size
        defaultUserImage(sigleUser.attrs.username, 64)
    : undefined;

  const profileRoute = user && getProfileRoute({ username: user.username });
  const settingsRoute = getSettingsRoute();

  return (
    <HeaderShadow>
      <Container>
        <MobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onLogin={() => setLoginOpen(true)}
          onLogout={handleLogout}
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

          <Link href="/discover">
            <HeaderLink>Discover</HeaderLink>
          </Link>
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
            <HeaderButtonNewStory
              color="primary"
              onClick={handleNewStory}
              disabled={createStoryLoading}
            >
              {createStoryLoading ? 'Creating...' : 'New story'}
            </HeaderButtonNewStory>
          )}

          {!loading && user && profileRoute && (
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
                    Router.push(profileRoute.href, profileRoute.as)
                  }
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onSelect={() =>
                    Router.push(settingsRoute.href, settingsRoute.as)
                  }
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
