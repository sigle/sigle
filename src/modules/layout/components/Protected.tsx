import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { userSession } from '../../../utils/blockstack';
import { Login } from './Login';

interface Props {
  children: JSX.Element;
}

export const Protected = ({ children }: Props) => {
  const [loggedIn, setLoggedIn] = useState(!!userSession.isUserSignedIn());
  const [loggingIn, setLoggingIn] = useState(!!userSession.isSignInPending());

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession
        .handlePendingSignIn()
        .then(() => {
          setLoggingIn(false);
          setLoggedIn(true);
        })
        .catch((error: Error) => {
          setLoggingIn(false);
          toast.error(error.message);
        });
    }
  }, []);

  if (loggingIn) {
    return <div>Loading ...</div>;
  }

  if (!loggedIn) {
    return <Login />;
  }

  return children;
};
