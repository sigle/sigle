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
  const [state, setState] = useState({
    loggedIn: config.isServer ? false : !!userSession.isUserSignedIn(),
    loggingIn: config.isServer ? true : !!userSession.isSignInPending(),
  });

  useEffect(() => {
    if (userSession.isUserSignedIn() && !state.loggedIn) {
      setState({
        loggedIn: true,
        loggingIn: false,
      });
    } else if (userSession.isSignInPending()) {
      userSession
        .handlePendingSignIn()
        .then(() => {
          setState({
            loggedIn: true,
            loggingIn: false,
          });
        })
        .catch((error: Error) => {
          setState({
            loggedIn: false,
            loggingIn: false,
          });
          toast.error(error.message);
        });
    } else if (state.loggingIn) {
      setState({
        loggedIn: false,
        loggingIn: false,
      });
    }
  }, []);

  if (state.loggingIn) {
    // TODO nice loading
    return <div>Loading ...</div>;
  }

  if (!state.loggedIn) {
    router.push('/login');
    return null;
  }

  return children;
};
