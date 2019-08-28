import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import Router from 'next/router';
import { MdSort } from 'react-icons/md';
import Link from 'next/link';
import { QueryRenderer, graphql } from 'react-relay';
import {
  Container,
  Button,
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
} from '../../../components';
import { MobileMenu } from './MobileMenu';
import { SignInDialog } from '../../dialog/SignInDialog';
import { getProfileRoute, getSettingsRoute } from '../../../utils/routes';
import { environment } from '../../../utils/relay';
import { HeaderUserQuery } from './__generated__/HeaderUserQuery.graphql';
import { User } from '../../../types';

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

interface Props {
  loading: boolean;
  user?: User;
  createStoryLoading: boolean;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  loginOpen: boolean;
  setLoginOpen: (value: boolean) => void;
  handleLogin: () => void;
  handleLogout: () => void;
  handleNewStory: () => void;
}

export const Header = ({
  loading,
  user,
  createStoryLoading,
  menuOpen,
  setMenuOpen,
  loginOpen,
  setLoginOpen,
  handleLogin,
  handleLogout,
  handleNewStory,
}: Props) => {
  const profileRoute = user && getProfileRoute({ username: user.username });
  const settingsRoute = getSettingsRoute();

  return (
    <HeaderShadow>
      <Container>
        <HeaderContainer>
          <SignInDialog open={loginOpen} onClose={() => setLoginOpen(false)} />

          <HeaderIcon size={30} onClick={() => setMenuOpen(true)} />

          <Link href="/">
            <HeaderLogo
              src={require('../../../images/logo.png?size=100')}
              alt="Sigle logo"
            />
          </Link>

          <HeaderSeparator />

          <Link href="/discover">
            <HeaderLink>Discover</HeaderLink>
          </Link>

          {/* TODO nice loading */}
          {loading && <div>Loading ...</div>}

          {!loading && !user && (
            // <HeaderButton color="black" onClick={() => setLoginOpen(true)}>
            <HeaderButton color="black" onClick={handleLogin}>
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

          {user && (
            <QueryRenderer<HeaderUserQuery>
              environment={environment}
              query={graphql`
                query HeaderUserQuery($username: String!) {
                  user(username: $username) {
                    id
                    # 64 here is used for the mobile size
                    imageUrl(size: 64)
                  }
                }
              `}
              variables={{
                username: user.username,
              }}
              render={({ props }) => (
                <React.Fragment>
                  {props && props.user && profileRoute && (
                    <Menu>
                      <MenuButton>
                        <HeaderUserPhoto
                          src={props && props.user.imageUrl}
                          alt={user.username}
                        />
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

                  <MobileMenu
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    onLogin={() => setLoginOpen(true)}
                    onLogout={handleLogout}
                    user={user}
                    userImage={
                      props && props.user && props.user.imageUrl
                        ? props.user.imageUrl
                        : undefined
                    }
                  />
                </React.Fragment>
              )}
            />
          )}
        </HeaderContainer>
      </Container>
    </HeaderShadow>
  );
};
