import React from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';

const FullScreenLoadingContainer = styled.div`
  ${tw`w-full h-screen flex flex-col items-center justify-center`};

  img {
    width: 250px;
  }

  p {
    ${tw`mt-4 text-xl`};
  }
`;

interface Props {
  children: JSX.Element;
}

export const Protected = ({ children }: Props) => {
  const router = useRouter();
  const { user, loggingIn } = useAuth();

  // We show a big loading screen while the user is signing in
  if (loggingIn) {
    return (
      <FullScreenLoadingContainer>
        <img src="/static/img/logo.png" alt="Logo Sigle" />
        <p>Loading ...</p>
      </FullScreenLoadingContainer>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return children;
};
