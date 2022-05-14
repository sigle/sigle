import React, { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { UserData } from '@stacks/auth';
import type { UserData as LegacyUserData } from '@stacks/legacy-auth';
import posthog from 'posthog-js';
import { useIsStateMounted } from '../../utils/hooks/useIsMounted';

const AuthStacks = dynamic(() => import('./AuthStacks'), {
  ssr: false,
});

/**
 * This interface is needed for now as users connected via Blockstack connect will see their username injected.
 * Can be removed when we remove Blockstack connect.
 */
interface UserDataWithUsername extends UserData {
  username: string;
}

const AuthContext = React.createContext<{
  user?: UserDataWithUsername | LegacyUserData;
  isLegacy?: boolean;
  loggingIn: boolean;
  setUsername: (username: string) => void;
}>({ loggingIn: false, setUsername: () => {} });

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const isMounted = useIsStateMounted();
  const [state, setState] = useState<{
    loggingIn: boolean;
    isLegacy?: boolean;
    user?: UserDataWithUsername | LegacyUserData;
  }>({
    loggingIn: true,
  });

  useEffect(() => {
    if (state.user) {
      posthog.identify(state.user.profile.stxAddress, {
        username: state.user.username,
        isLegacy: state.isLegacy,
      });
    }
  }, [state.user, state.isLegacy]);

  const handleSetUsername = useCallback((username: string) => {
    // const userData = userSession.loadUserData();
    // setState({
    //   loggingIn: false,
    //   user: {
    //     ...userData,
    //     username,
    //   },
    // });
  }, []);

  const userApi = useMemo(() => ({ handleSetUsername }), []);

  // When the component is mounted (client side), inject the Hiro wallet lazily loaded
  if (isMounted) {
    return (
      <AuthStacks loggingIn={state.loggingIn} setAuthState={setState}>
        <AuthContext.Provider
          value={{
            user: state.user,
            loggingIn: state.loggingIn,
            setUsername: userApi.handleSetUsername,
          }}
        >
          {children}
        </AuthContext.Provider>
      </AuthStacks>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loggingIn: state.loggingIn,
        setUsername: userApi.handleSetUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
