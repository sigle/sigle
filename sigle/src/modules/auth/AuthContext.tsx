import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import type { UserData } from '@stacks/auth';
import type { UserData as LegacyUserData } from '@stacks/legacy-auth';
import { Connect, AuthOptions } from '@stacks/connect-react';
import {
  Connect as LegacyConnect,
  AuthOptions as LegacyAuthOptions,
} from '@stacks/legacy-connect-react';
import posthog from 'posthog-js';
import { userSession } from '../../utils/blockstack';

const AuthContext = React.createContext<{
  user?: UserData | LegacyUserData;
  isLegacy?: boolean;
  loggingIn: boolean;
  setUsername: (username: string) => void;
}>({ loggingIn: false, setUsername: () => {} });

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<{
    loggingIn: boolean;
    isLegacy?: boolean;
    user?: UserData | LegacyUserData;
  }>({
    loggingIn: true,
  });

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      handleAuthSignIn();
    } else if (userSession.isSignInPending()) {
      userSession
        .handlePendingSignIn()
        .then(handleAuthSignIn)
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
        isLegacy: state.isLegacy,
      });
    }
  }, [state.user, state.isLegacy]);

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

    /**
     * Try to find if a username is registered in localStorage.
     * If userData.username is empty, we will use the username from localStorage.
     * If userData.username value is returned by the API we can clean the localStorage.
     */
    const username = localStorage.getItem(`sigle-username-${address}`);
    if (username) {
      if (username === userData.username) {
        localStorage.removeItem(`sigle-username-${address}`);
      } else {
        userData.username = username;
      }
    }

    setState({
      loggingIn: false,
      user: userData,
    });
  };

  const appDetails = {
    name: 'Sigle',
    icon: 'https://app.sigle.io/icon-192x192.png',
  };

  const authOptions: AuthOptions = {
    redirectTo: '/',
    appDetails,
    userSession,
    onFinish: handleAuthSignIn,
  };

  const handleSetUsername = useCallback((username: string) => {
    const userData = userSession.loadUserData();
    userData.username = username;

    setState({
      loggingIn: false,
      user: userData,
    });
  }, []);

  const userApi = useMemo(() => ({ handleSetUsername }), []);

  const legacyAuthOptions: LegacyAuthOptions = {
    redirectTo: '/',
    registerSubdomain: true,
    appDetails,
    userSession,
    finished: () => {
      setState({
        loggingIn: false,
        isLegacy: true,
        user: userSession.loadUserData(),
      });
    },
  };

  return (
    <LegacyConnect authOptions={legacyAuthOptions}>
      <Connect authOptions={authOptions}>
        <AuthContext.Provider
          value={{
            user: state.user,
            loggingIn: state.loggingIn,
            setUsername: userApi.handleSetUsername,
          }}
        >
          {children}
        </AuthContext.Provider>
      </Connect>
    </LegacyConnect>
  );
};

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
