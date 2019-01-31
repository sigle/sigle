import React, { useEffect, useState } from 'react';
import * as blockstack from 'blockstack';
import { Login } from './Login';

interface Props {
  children: JSX.Element;
}

export const Protected = ({ children }: Props) => {
  const [loggedIn, setLoggedIn] = useState(!!blockstack.isUserSignedIn());
  const [loggingIn, setLoggingIn] = useState(!!blockstack.isSignInPending());

  useEffect(() => {
    if (blockstack.isSignInPending()) {
      blockstack
        .handlePendingSignIn()
        .then(() => {
          setLoggingIn(false);
          setLoggedIn(true);
        })
        .catch((error: any) => {
          setLoggingIn(false);
          alert(error.message);
        });
    }
  }, [false]);

  if (loggingIn) {
    return <div>Loading ...</div>;
  }

  if (!loggedIn) {
    return <Login />;
  }

  return children;
};
