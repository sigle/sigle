import React, { createContext, useState, useEffect } from 'react';
import { getConfig, User as RadiksUser } from 'radiks';
import { User } from '../types';

export const UserContext = createContext<{ user?: User }>({});

interface Props {
  children: React.ReactNode;
}

export const UserContextProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | undefined>(undefined);

  const fetchUser = async () => {
    const { userSession } = getConfig();
    if (userSession.isSignInPending()) {
      await userSession.handlePendingSignIn();
      await RadiksUser.createWithCurrentUser();
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
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
