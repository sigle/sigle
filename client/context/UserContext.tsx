import React, { createContext, useState, useEffect } from 'react';
import { getConfig, User } from 'radiks';

export const UserContext = createContext<any>(null);

interface Props {
  children: React.ReactNode;
}

export const UserContextProvider = ({ children }: Props) => {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const { userSession } = getConfig();
    if (userSession.isSignInPending()) {
      await userSession.handlePendingSignIn();
      await User.createWithCurrentUser();
    }
    if (userSession.isUserSignedIn()) {
      const user = await userSession.loadUserData();
      setUser(user);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={[user, setUser]}>
      {children}
    </UserContext.Provider>
  );
};
