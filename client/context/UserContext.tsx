import React, { createContext, useState, useEffect } from 'react';
import { getConfig, User as RadiksUser } from 'radiks';
import { User, RadiksSigleUser } from '../types';
import { SigleUser } from '../models';

export const UserContext = createContext<{
  user?: User;
  sigleUser?: RadiksSigleUser;
  loading?: boolean;
  setUser?: React.Dispatch<React.SetStateAction<User | undefined>>;
}>({});

interface Props {
  children: React.ReactNode;
}

export const UserContextProvider = ({ children }: Props) => {
  // TODO useReducer
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [sigleUser, setSigleUser] = useState<RadiksSigleUser | undefined>(
    undefined
  );

  const fetchUser = async () => {
    const { userSession } = getConfig();
    if (userSession.isSignInPending()) {
      await userSession.handlePendingSignIn();
      await RadiksUser.createWithCurrentUser();
    }
    if (userSession.isUserSignedIn()) {
      const user = await userSession.loadUserData();
      const sigleUserResponse = new SigleUser({ _id: user.username });
      await sigleUserResponse.fetch();
      setUser(user);
      setSigleUser(sigleUserResponse);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, sigleUser, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
