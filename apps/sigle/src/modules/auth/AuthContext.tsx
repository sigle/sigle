import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import type { UserData } from '@stacks/auth';
import { Connect, AuthOptions } from '@stacks/connect-react';
import posthog from 'posthog-js';
import { userSession } from '../../utils/stacks';

/**
 * This interface is needed for now as users connected via Blockstack connect will see their username injected.
 * Can be removed when we remove Blockstack connect.
 */
interface UserDataWithUsername extends UserData {
  username: string;
}

const AuthContext = React.createContext<{
  user?: UserDataWithUsername;
  loggingIn: boolean;
  setUsername: (username: string) => void;
  logout: () => void;
}>({
  loggingIn: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUsername: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<{
    loggingIn: boolean;
    user?: UserDataWithUsername;
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
      posthog.identify(
        state.user.profile.stxAddress.mainnet
          ? state.user.profile.stxAddress.mainnet
          : state.user.profile.stxAddress,
        {
          username: state.user.username,
        },
      );
    }
  }, [state.user]);

  const handleAuthSignIn = async () => {
    const userData = userSession.loadUserData() as UserDataWithUsername;
    const address = userData.profile.stxAddress.mainnet;

    /**
     * We try to manually inject the user's username into the userData object,
     * to fix the following edge case:
     * 1. Username is not populated for .btc names https://github.com/hirosystems/stacks.js/issues/1144
     * 2. When registering a new free subdomain with Sigle, it takes time to get injected by
     * the Hiro wallet.
     */
    if (userData.username === undefined && address) {
      try {
        const namesResponse = await fetch(
          `https://api.hiro.so/v1/addresses/stacks/${address}`,
        );
        const namesJson = await namesResponse.json();
        if (namesJson.names && namesJson.names.length > 0) {
          // If user has multiple subdomains we use the .btc
          // This can happen with free subdomains and .btc
          userData.username =
            namesJson.names.find(
              (name: string) => name.endsWith('.btc') === true,
            ) || namesJson.names[0];
        } else {
          // Used for debug purpose when a user is redirect to the register username page
          // and has a .btc name linked to his address
          console.info(`No names found for ${address}`);
        }
      } catch (e) {}
    }

    /**
     * Add a way to bypass the username check
     * This is useful when there are problems with the API but users want to use the app anyway
     */
    if (userData.username === undefined && address) {
      const searchParams = new URLSearchParams(window.location.search);
      const bypassUsernameCheck = searchParams.get('bypass-username');
      if (bypassUsernameCheck === 'true') {
        userData.username = 'bypass-username';
        console.info(`Bypass username check for ${address}`);
      }
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

    setState({
      loggingIn: false,
      user: {
        ...userData,
        username,
      },
    });
  }, []);

  const handleLogout = useCallback(() => {
    userSession.signUserOut();

    setState({
      loggingIn: false,
      user: undefined,
    });
  }, []);

  const userApi = useMemo(() => ({ handleSetUsername, handleLogout }), []);

  return (
    <Connect authOptions={authOptions}>
      <AuthContext.Provider
        value={{
          user: state.user,
          loggingIn: state.loggingIn,
          setUsername: userApi.handleSetUsername,
          logout: userApi.handleLogout,
        }}
      >
        {children}
      </AuthContext.Provider>
    </Connect>
  );
};

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
