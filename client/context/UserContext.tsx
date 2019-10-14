import React, { createContext, useState, useEffect } from 'react';
import { getConfig, User as RadiksUser } from 'radiks';
import { toast } from 'react-toastify';
import { User } from '../types';

export const UserContext = createContext<{
  user?: User;
  setUser?: React.Dispatch<React.SetStateAction<User | undefined>>;
  loading?: boolean;
}>({});

interface Props {
  children: React.ReactNode;
}

export const UserContextProvider = ({ children }: Props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | undefined>(undefined);

  const fetchUser = async () => {
    const { userSession } = getConfig();
    if (userSession.isSignInPending()) {
      try {
        await userSession.handlePendingSignIn();
        await RadiksUser.createWithCurrentUser();
      } catch (error) {
        toast.error(error.message);
      }
    }
    if (userSession.isUserSignedIn()) {
      const user = await userSession.loadUserData();
      setUser(user);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
