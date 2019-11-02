import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { userSession } from '../../utils/blockstack';
import { config } from '../../config';

interface Props {
  children: JSX.Element;
}

export const Protected = ({ children }: Props) => {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(
    config.isServer ? false : !!userSession.isUserSignedIn()
  );
  const [loggingIn, setLoggingIn] = useState(
    config.isServer ? true : !!userSession.isSignInPending()
  );

  useEffect(() => {
    if (userSession.isUserSignedIn() && !loggedIn) {
      setLoggingIn(false);
      setLoggedIn(true);
    } else if (userSession.isSignInPending()) {
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
    } else if (loggingIn) {
      setLoggingIn(false);
    }
  }, []);

  if (loggingIn) {
    // TODO nice loading
    return <div>Loading ...</div>;
  }

  if (!loggedIn) {
    router.push('/login');
    return null;
  }

  return children;
};
