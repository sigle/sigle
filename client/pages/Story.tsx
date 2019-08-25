import React from 'react';
import { graphql } from 'react-relay';
import { FullHeightContainer, MinHeightContainer } from '../components';
import { withData } from '../lib/withData';
import { Header } from '../modules/layout/containers/Header';
import { Footer } from '../modules/layout/components/Footer';
import { PublicStory } from '../modules/publicStory/PublicStory';
import { StoryUserQueryResponse } from './__generated__/StoryUserQuery.graphql';

type Props = StoryUserQueryResponse;

export const StoryComponent = ({ publicStory }: Props) => (
  <FullHeightContainer>
    <Header />
    <MinHeightContainer>
      {/* TODO 404 not found */}
      {publicStory && <PublicStory story={publicStory} />}
      <Footer />
    </MinHeightContainer>
  </FullHeightContainer>
);

StoryComponent.getInitialProps = async ({
  query,
}: {
  query: { storyId: string; username: string };
}) => {
  const { username, storyId } = query;
  return { relayVariables: { username, storyId } };
};

export const Story = withData(StoryComponent, {
  query: graphql`
    query StoryUserQuery($username: String!, $storyId: String!) {
      publicStory(username: $username, storyId: $storyId) {
        id
        ...PublicStory_story
      }
    }
  `,
});
