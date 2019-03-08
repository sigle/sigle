import React, { useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components/macro';
import { userSession } from '../../../utils/blockstack';
import { AppBar } from './AppBar';
import { BlockstackUser } from '../../../types';
import { Footer } from './Footer';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
  }
`;

interface Props {
  children: React.ReactChild;
}

export const LoggedIn = ({ children }: Props) => {
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
  }, [false]);

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
      <GlobalStyle />
      <AppBar user={user} />

      {children}
      <Footer />
    </React.Fragment>
  );
};
