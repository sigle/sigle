import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Connect, AuthOptions } from '@stacks/connect-react';
import posthog from 'posthog-js';
import { BlockstackUser } from '../../types';
import { userSession } from '../../utils/blockstack';

const AuthContext = React.createContext<{
  user?: BlockstackUser;
  loggingIn: boolean;
}>({ loggingIn: false });

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<{
    loggingIn: boolean;
    user?: BlockstackUser;
  }>({
    loggingIn: true,
  });

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setState({
        loggingIn: false,
        user: userSession.loadUserData(),
      });
    } else if (userSession.isSignInPending()) {
      userSession
        .handlePendingSignIn()
        .then(() => {
          setState({
            loggingIn: false,
            user: userSession.loadUserData(),
          });
        })
        .catch((error: Error) => {
          setState({
            loggingIn: false,
          });
          console.error(error);
          toast.error(error.message);
        });
    } else if (state.loggingIn) {
      setState({
        loggingIn: false,
      });
    }
  }, []);

  useEffect(() => {
    if (state.user) {
      posthog.identify(state.user.profile.stxAddress, {
        username: state.user.username,
      });
    }
  }, [state.user]);

  const authOptions: AuthOptions = {
    redirectTo: '/',
    registerSubdomain: true,
    appDetails: {
      name: 'Sigle',
      icon: 'https://app.sigle.io/icon-192x192.png',
    },
    userSession,
    finished: () => {
      setState({
        loggingIn: false,
        user: userSession.loadUserData(),
      });
    },
  };

  return (
    <Connect authOptions={authOptions}>
      <AuthContext.Provider
        value={{ user: state.user, loggingIn: state.loggingIn }}
      >
        {children}
      </AuthContext.Provider>
    </Connect>
  );
};

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
