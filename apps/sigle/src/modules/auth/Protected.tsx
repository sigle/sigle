import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { parseZoneFile } from 'zone-file';
import { FullScreenLoading } from '../../components/layout/full-screen-loading';
import { useAuth } from './AuthContext';

interface Props {
  children: JSX.Element;
}

export const Protected = ({ children }: Props) => {
  const router = useRouter();
  const { user, loggingIn } = useAuth();
  const { status } = useSession();

  useEffect(() => {
    const checkBnsConfiguration = async () => {
      if (user?.username && user.username !== 'bypass-username') {
        try {
          const namesResponse = await fetch(
            `https://api.hiro.so/v1/names/${user.username}`,
          );
          const namesJson = (await namesResponse.json()) as {
            zonefile?: string;
          };
          // If the zonefile is non existant or empty the user needs to configure it
          if (!namesJson.zonefile || namesJson.zonefile === '') {
            router.push('/configure-bns');
          }
          // If missing the profile url the user needs to configure it
          if (namesJson.zonefile) {
            const parseZoneFileResult: {
              uri?: { name: string; target: string }[];
            } = parseZoneFile(namesJson.zonefile);
            const profileUrl = parseZoneFileResult.uri?.find(
              (uri) => uri.name === '_http._tcp',
            );
            if (!profileUrl) {
              router.push('/configure-bns');
            }
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
  if (!user || status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (!user.username) {
    router.push('/register-username');
    return null;
  }

  return children;
};
