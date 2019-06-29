import React from 'react';
import {
  FullHeightContainer,
  MinHeightContainer,
  Container,
} from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { PublicStory } from '../modules/publicStory/PublicStory';

export const Story = () => (
  <FullHeightContainer>
    <Header />
    <MinHeightContainer>
      <Container>
        <PublicStory />
      </Container>
      <Footer />
    </MinHeightContainer>
  </FullHeightContainer>
);
