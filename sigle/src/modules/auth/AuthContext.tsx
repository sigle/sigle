import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { UserData } from '@stacks/auth';
import { Connect, AuthOptions } from '@stacks/connect-react';
import posthog from 'posthog-js';
import { userSession } from '../../utils/blockstack';

const AuthContext = React.createContext<{
  user?: UserData;
  loggingIn: boolean;
}>({ loggingIn: false });

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<{
    loggingIn: boolean;
    user?: UserData;
  }>({
    loggingIn: true,
  });

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      handleAuthSignIn();
    } else if (userSession.isSignInPending()) {
      userSession
        .handlePendingSignIn()
        .then(() => {
          handleAuthSignIn();
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
    appDetails: {
      name: 'Sigle',
      icon: 'https://app.sigle.io/icon-192x192.png',
    },
    userSession,
    onFinish: () => {
      handleAuthSignIn();
    },
  };

  const handleAuthSignIn = async () => {
    const userData = userSession.loadUserData();
    const address = userData.profile.stxAddress.mainnet;

    /**
     * We try to manually inject the user's username into the userData object,
     * to fix the following edge case:
     * 1. Username is not populated for .btc names https://github.com/hirosystems/stacks.js/issues/1144
     * 2. When registering a new free subdomain with Sigle, it takes time to get injected by
     * the Hiro wallet.
     */
    if (userData.username === '') {
      try {
        const namesResponse = await fetch(
          `https://stacks-node-api.stacks.co/v1/addresses/stacks/${address}`
        );
        const namesJson = await namesResponse.json();
        if ((namesJson.names.length || 0) > 0) {
          userData.username = namesJson.names[0];
        }
      } catch (e) {}
    }

    setState({
      loggingIn: false,
      user: userData,
    });
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
