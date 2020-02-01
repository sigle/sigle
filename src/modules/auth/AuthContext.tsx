import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
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
          // TODO cleanup token in the url
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

  return (
    <AuthContext.Provider
      value={{ user: state.user, loggingIn: state.loggingIn }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
