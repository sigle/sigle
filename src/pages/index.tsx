import React from 'react';
import styled from 'styled-components';
import { Protected } from '../modules/auth/Protected';
import { LoggedIn } from '../modules/layout/components/LoggedIn';

const Title = styled.h1`
  font-size: 50px;
`;

const Home = () => {
  return (
    <Protected>
      <LoggedIn>
        <Title>Welcome to Next.js!</Title>
      </LoggedIn>
    </Protected>
  );
};

export default Home;
