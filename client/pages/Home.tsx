import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Box, Heading } from 'rebass';
import { Button } from '../components/Button';
import tw from 'tailwind.macro';

let Test = tw.div`bg-blue-500 text-white p-2`;

const Title = styled.h1`
  color: red;
  font-size: 50px;
`;

export const Home = () => (
  <React.Fragment>
    <Test>Yo</Test>
    <ul>
      <li>
        <Link href="/a" as="/a">
          <a>a</a>
        </Link>
      </li>
      <li>
        <Link href="/b" as="/b">
          <a>b</a>
        </Link>
      </li>
      <li>
        <Title>Heyo</Title>
      </li>
    </ul>
    <Box>
      <Heading>Hello</Heading>
      <Button>Rebass</Button>
      <Button variant="primary">Rebass</Button>
      <Button variant="outline">Rebass</Button>
    </Box>
  </React.Fragment>
);
