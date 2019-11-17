import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import Tippy from '@tippy.js/react';
import { IoIosEye } from 'react-icons/io';
import { userSession } from '../../../utils/blockstack';
import { AppBar, AppBarRightContainer } from './AppBar';
import { BlockstackUser } from '../../../types';

const Name = styled.a`
  ${tw`mr-8 flex items-center cursor-pointer text-black no-underline`};
`;

const Logout = styled.div`
  ${tw`font-semibold cursor-pointer`}
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
    <React.Fragment>
      {showAppBar && (
        <AppBar>
          <AppBarRightContainer>
            <Tippy content={user.username} theme="light-border">
              <Name href={`/${user.username}`} target="_blank">
                <IoIosEye size={22} style={{ marginRight: 6 }} /> Visit my blog
              </Name>
            </Tippy>
            <Logout onClick={handleLogout}>Logout</Logout>
          </AppBarRightContainer>
        </AppBar>
      )}

      {children}
    </React.Fragment>
  );
};
