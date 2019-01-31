import React from 'react';
import * as blockstack from 'blockstack';
import { useWindowSize } from 'the-platform';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import logo from '../../../img/logo.svg';
import one from '../../../img/one.png';
import { Button } from '../../../components';

const Container = styled.div`
  ${tw`flex items-center justify-center flex-col p-8`};
`;

const Logo = styled.img`
  width: 80px;
`;

const Illu = styled.img`
  ${tw`mt-4 mb-4`};
  width: 300px;
  max-width: 100%;
`;

// TODO nice Login page
export const Login = () => {
  const { height } = useWindowSize();

  const handleLogin = () => {
    const origin = window.location.origin;
    blockstack.redirectToSignIn(origin, `${origin}/manifest.json`, [
      'store_write',
      'publish_data',
    ]);
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
