import { useEffect } from 'react';
import { Connect, AuthOptions } from '@stacks/connect-react';
import {
  Connect as LegacyConnect,
  AuthOptions as LegacyAuthOptions,
} from '@stacks/legacy-connect-react';
import type { UserData } from '@stacks/auth';
import type { UserData as LegacyUserData } from '@stacks/legacy-auth';
import { toast } from 'react-toastify';
import { userSession, legacyUserSession } from '../../utils/blockstack';

/**
 * This interface is needed for now as users connected via Blockstack connect will see their username injected.
 * Can be removed when we remove Blockstack connect.
 */
export interface UserDataWithUsername extends UserData {
  username: string;
}

interface AuthStacksProps {
  children: React.ReactNode;
  loggingIn: boolean;
  setAuthState: (state: {
    loggingIn: boolean;
    isLegacy?: boolean;
    user?: UserDataWithUsername | LegacyUserData;
  }) => void;
}

const AuthStacks = ({ children, loggingIn, setAuthState }: AuthStacksProps) => {
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      handleAuthSignIn();
    } else if (userSession.isSignInPending()) {
      userSession
        .handlePendingSignIn()
        .then(handleAuthSignIn)
        .catch((error: Error) => {
          setAuthState({
            loggingIn: false,
          });
          console.error(error);
          toast.error(error.message);
        });
    } else if (loggingIn) {
      setAuthState({
        loggingIn: false,
      });
    }
  }, []);

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
    setAuthState({
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

  const legacyAuthOptions: LegacyAuthOptions = {
    redirectTo: '/',
    registerSubdomain: true,
    appDetails,
    userSession: legacyUserSession,
    finished: () => {
      setAuthState({
        loggingIn: false,
        isLegacy: true,
        user: legacyUserSession.loadUserData(),
      });
    },
  };

  return (
    <LegacyConnect authOptions={legacyAuthOptions}>
      <Connect authOptions={authOptions}>{children}</Connect>
    </LegacyConnect>
  );
};

// Must export as default as used as a dynamic component
export default AuthStacks;
