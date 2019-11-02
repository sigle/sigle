import React from 'react';
import styled from 'styled-components';
import { Protected } from '../modules/auth/Protected';

const Title = styled.h1`
  font-size: 50px;
`;

const Home = () => {
  return (
    <Protected>
      <Title>Welcome to Next.js!</Title>
    </Protected>
  );
};

export default Home;
