import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useAuth } from './AuthContext';
import { FullScreenLoading } from '../layout/components/FullScreenLoading';

interface Props {
  children: JSX.Element;
}

export const Protected = ({ children }: Props) => {
  const router = useRouter();
  const { user, isLegacy, loggingIn } = useAuth();
  const { status } = useSession();

  useEffect(() => {
    const checkBnsConfiguration = async () => {
      if (user && user.username) {
        try {
          const namesResponse = await fetch(
            `https://stacks-node-api.stacks.co/v1/names/${user.username}`
          );
          const namesJson = (await namesResponse.json()) as {
            zonefile: string;
          };
          if (namesJson.zonefile === '') {
            router.push('/configure-bns');
          }
        } catch (e) {}
      }
    };

    checkBnsConfiguration();
  }, [user]);

  // We show a big loading screen while the user is signing in
  if (loggingIn || status === 'loading') {
    return <FullScreenLoading />;
  }

  // If user is not logged in
  // If non legacy user doesn't have a session
  if (!user || (!isLegacy && status === 'unauthenticated')) {
    router.push('/login');
    return null;
  }

  if (!user.username) {
    router.push('/register-username');
    return null;
  }

  return children;
};
