import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Me as MeContainer } from '../modules/layout/components/Me';
import {
  FullHeightContainer,
  MinHeightContainer,
  Container,
} from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';

const Title = styled.h2`
  ${tw`text-2xl font-bold mb-2`};
`;

const StatsImage = styled.img`
  ${tw`m-auto`};
  width: 300px;
`;

export const Stats = () => (
  <FullHeightContainer>
    <Header />
    <MinHeightContainer>
      <Container>
        <MeContainer>
          <Title>My stats</Title>
          <p>Coming soon...</p>

          <StatsImage src="/static/images/data.png" alt="Stats" />
        </MeContainer>
      </Container>
      <Footer />
    </MinHeightContainer>
  </FullHeightContainer>
);
