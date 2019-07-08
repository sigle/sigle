import React from 'react';
import { NextPage } from 'next';
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

export const Story: NextPage<Props> = ({ storyId }: Props) => (
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

Story.getInitialProps = async ({ query }) => {
  const { storyId, username } = query as { storyId: string; username: string };
  return { storyId, username };
};
