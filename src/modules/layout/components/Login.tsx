import React from 'react';
import { useWindowSize } from 'the-platform';
import styled, { css } from 'styled-components/macro';
import tw from 'tailwind.macro';
import { userSession } from '../../../utils/blockstack';
import logo from '../../../img/logo.png';
import logoLogin from '../../../img/logo-login.png';
import loginImage from '../../../img/login.png';
import { Button } from '../../../components';
import { config } from '../../../config';

const BackgroundContainer = styled.div`
  ${tw`flex`};
  width: 100%;
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
      background-image: url("${logoLogin}");
    `}
`;

const AbsoluteContainer = styled.div`
  ${tw`absolute`};
  width: 100%;
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

export const Login = () => {
  const { height } = useWindowSize();

  const handleLogin = () => {
    userSession.redirectToSignIn();
  };

  return (
    <React.Fragment>
      <BackgroundContainer style={{ height }}>
        <BackgroundColumn />
        <BackgroundColumn right />
      </BackgroundContainer>
      <AbsoluteContainer style={{ height }}>
        <Container>
          <Column left>
            <Logo src={logo} alt="Logo" />
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
            <Text>Welcome to the family 🙂</Text>
            <div>
              <Button onClick={handleLogin}>Login with blockstack</Button>
            </div>
          </Column>
          <Column right>
            <Illu src={loginImage} alt="Login image" />
          </Column>
        </Container>
      </AbsoluteContainer>
    </React.Fragment>
  );
};
