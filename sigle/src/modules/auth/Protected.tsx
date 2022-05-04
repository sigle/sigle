import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';
import { FullScreenLoading } from '../layout/components/FullScreenLoading';

interface Props {
  children: JSX.Element;
}

export const Protected = ({ children }: Props) => {
  const router = useRouter();
  const { user, loggingIn } = useAuth();

  // We show a big loading screen while the user is signing in
  if (loggingIn) {
    return <FullScreenLoading />;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!user.username) {
    router.push('/register-username');
    return null;
  }

  return children;
};
