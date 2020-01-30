import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { userSession } from '../../utils/blockstack';
import { config } from '../../config';

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
  const [state, setState] = useState({
    loggedIn: false,
    loggingIn: true,
  });

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setState({
        loggedIn: true,
        loggingIn: false,
      });
    } else if (userSession.isSignInPending()) {
      userSession
        .handlePendingSignIn()
        .then(() => {
          setState({
            loggedIn: true,
            loggingIn: false,
          });
        })
        .catch((error: Error) => {
          setState({
            loggedIn: false,
            loggingIn: false,
          });
          console.error(error);
          toast.error(error.message);
        });
    } else if (state.loggingIn) {
      setState({
        loggedIn: false,
        loggingIn: false,
      });
    }
  }, []);

  if (state.loggingIn) {
    return (
      <FullScreenLoadingContainer>
        <img src="/static/img/logo.png" alt="Logo Sigle" />
        <p>Loading ...</p>
      </FullScreenLoadingContainer>
    );
  }

  if (!state.loggedIn) {
    router.push('/login');
    return null;
  }

  return children;
};
