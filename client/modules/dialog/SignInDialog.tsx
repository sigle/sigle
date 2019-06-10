import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import '@reach/dialog/styles.css';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { getConfig } from 'radiks';
import { config } from '../../config';

const StyledDialogContent = styled(DialogContent)`
  ${tw`flex flex-wrap p-0 bg-grey-light shadow-lg`};
  border-radius: 1.25rem;
  overflow: hidden;
  width: 85vw;

  @media (min-width: ${config.breakpoints.lg}px) {
    width: 60vw;
  }
`;

const Column = styled.div`
  ${tw`w-full lg:w-1/2 py-8 px-8 bg-white`};
`;

const ColumnRight = styled(Column)`
  ${tw`bg-grey-light`};
  display: flex;
  flex-direction: column;
  align-self: center;
`;

const Title = styled.h3`
  ${tw`text-3xl font-baskerville mb-4 font-bold`};
`;

const Text = styled.p`
  ${tw`mb-4`};
`;

const Link = styled.a`
  ${tw`text-primary`};
`;

const Login = styled.button`
  ${tw``};
`;

export const SignInDialog = () => {
  const handleLogin = () => {
    const { userSession } = getConfig();
    userSession.redirectToSignIn();
  };

  return (
    <DialogOverlay isOpen={true} onDismiss={() => null}>
      <StyledDialogContent>
        <Column>
          <Title>Hello!</Title>
          <Text>
            Because Sigle is working on the decentralized internet thanks to the
            blockchain technology, you’ll be redicrected to{' '}
            <Link href="https://blockstack.org/" target="_blank">
              Blockstack
            </Link>{' '}
            to login or sign in.
          </Text>
          <Text>
            Blockstack ID provides user-controlled login and storage that enable
            you to take back control of your identity and data.
          </Text>
          <Text>Creating a Blockstack ID is easy, free, and secure.</Text>
          <Text>Welcome to the family :)</Text>
          <Login onClick={handleLogin}>Login with blockstack</Login>
        </Column>
        <ColumnRight>
          <img src="/static/images/login.png" alt="login" />
        </ColumnRight>
      </StyledDialogContent>
    </DialogOverlay>
  );
};
