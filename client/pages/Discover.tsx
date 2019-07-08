import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { graphql } from 'react-relay';
import { withData } from '../lib/withData';
import {
  Container,
  FullHeightContainer,
  MinHeightContainer,
} from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { DiscoverQueryResponse } from './__generated__/DiscoverQuery.graphql';
import { PublicStoryItem } from '../modules/publicStories/components/PublicStoryItem';

const DiscoverContainer = styled(Container)`
  ${tw`py-4`};
`;

const DiscoverTitle = styled.h1`
  ${tw`text-lg mb-4`};
`;

type Props = DiscoverQueryResponse;

export const DiscoverComponent = ({ publicStories }: Props) => {
  return (
    <FullHeightContainer>
      <Header />
      <MinHeightContainer>
        <DiscoverContainer>
          <DiscoverTitle>Discover the latest stories</DiscoverTitle>

          {publicStories!.edges!.map(data => (
            <PublicStoryItem key={data!.node!.id} story={data!.node!} />
          ))}
        </DiscoverContainer>
        <Footer />
      </MinHeightContainer>
    </FullHeightContainer>
  );
};

export const Discover = withData(DiscoverComponent, {
  query: graphql`
    query DiscoverQuery {
      publicStories {
        totalCount
        edges {
          node {
            id
            ...PublicStoryItem_story
          }
        }
      }
    }
  `,
});
