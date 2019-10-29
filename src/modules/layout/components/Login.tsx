import React from 'react';
import { useWindowSize } from 'react-use';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { userSession } from '../../../utils/blockstack';
import logo from '../../../img/logo.png';
import one from '../../../img/one.png';
import { Button } from '../../../components';

const Container = styled.div`
  ${tw`flex items-center justify-center flex-col p-8`};
`;

const Logo = styled.img`
  width: 100px;
`;

const Illu = styled.img`
  ${tw`mt-6 mb-4`};
  width: 300px;
  max-width: 100%;
`;

export const Login = () => {
  const { height } = useWindowSize();

  const handleLogin = () => {
    userSession.redirectToSignIn();
  };

  return (
    <Container style={{ height }}>
      <Logo src={logo} alt="Logo" />
      <Illu src={one} alt="One" />
      <div>
        <Button onClick={handleLogin}>Login with blockstack</Button>
      </div>
    </Container>
  );
};
