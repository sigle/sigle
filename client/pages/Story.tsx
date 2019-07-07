import React from 'react';
import {
  FullHeightContainer,
  MinHeightContainer,
  Container,
} from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { PublicStory } from '../modules/publicStory/PublicStory';

interface Props {
  storyId: string;
  username: string;
}

export const Story = ({ storyId }: Props) => (
  <FullHeightContainer>
    <Header />
    <MinHeightContainer>
      <Container>
        <PublicStory storyId={storyId} />
      </Container>
      <Footer />
    </MinHeightContainer>
  </FullHeightContainer>
);

Story.getInitialProps = ({ query }: any) => {
  const { storyId, username } = query;
  return { storyId, username };
};
