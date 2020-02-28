import React from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import * as Fathom from 'fathom-client';
import { userSession } from '../utils/blockstack';
import { config } from '../config';
import { Button } from '../components';
import { Goals } from '../utils/fathom';

const BackgroundContainer = styled.div`
  ${tw`flex w-full h-screen`};

  @media (max-width: ${config.breakpoints.md}px) {
    display: none;
  }
`;

const BackgroundColumn = styled.div<{ right?: boolean }>`
  ${tw`flex-1`};
  background-color: #f7f7f7;
  ${props =>
    props.right &&
    css`
      ${tw`bg-white bg-no-repeat bg-contain bg-left`};
      background-image: url('/static/img/logo-login.png');
    `}
`;

const AbsoluteContainer = styled.div`
  ${tw`absolute w-full h-screen`};
  top: 0;
`;

const Container = styled.div`
  ${tw`flex items-center justify-center p-8 mx-auto`};
  height: 100%;
  width: 100%;
  max-width: 1140px;

  @media (max-width: ${config.breakpoints.md}px) {
    ${tw`block`};
  }
`;

const Column = styled.div<{ left?: boolean; right?: boolean }>`
  ${tw`w-1/2 flex flex-col text-left`};
  ${props =>
    props.left &&
    css`
      ${tw`pr-32`};
    `}
  ${props =>
    props.right &&
    css`
      ${tw`items-center`};
    `}
  @media (max-width: ${config.breakpoints.md}px) {
    ${tw`w-full pr-0`};
  }
`;

const Logo = styled.img`
  ${tw`mb-4`};
  width: 100px;
`;

const Illu = styled.img`
  ${tw`mt-6 mb-4`};
  width: 400px;
  max-width: 100%;
`;

const Text = styled.p`
  ${tw`mb-4`};
`;

const Link = styled.a`
  ${tw`text-pink`};
`;

const Login = () => {
  const handleLogin = () => {
    Fathom.trackGoal(Goals.LOGIN, 0);
    userSession.redirectToSignIn();
  };

  return (
    <React.Fragment>
      <BackgroundContainer>
        <BackgroundColumn />
        <BackgroundColumn right />
      </BackgroundContainer>
      <AbsoluteContainer>
        <Container>
          <Column left>
            <Logo src="/static/img/logo.png" alt="Logo" />
            <Text>
              Because Sigle is working on the decentralized internet thanks to
              the blockchain technology, you’ll be redicrected to{' '}
              <Link href="https://blockstack.org/" target="_blank">
                Blockstack
              </Link>{' '}
              to login or sign in.
            </Text>
            <Text>
              Blockstack ID provides user-controlled login and storage that
              enable you to take back control of your identity and data.
            </Text>
            <Text>Creating a Blockstack ID is easy, free, and secure.</Text>
            <Text>
              Welcome to the family{' '}
              <span role="img" aria-label="Smile">
                🙂
              </span>
            </Text>
            <div>
              <Button onClick={handleLogin}>Login with blockstack</Button>
            </div>
          </Column>
          <Column right>
            <Illu src="/static/img/login.png" alt="Login image" />
          </Column>
        </Container>
      </AbsoluteContainer>
    </React.Fragment>
  );
};

export default Login;
