import React, { useContext } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Me as MeContainer } from '../modules/layout/components/Me';
import {
  Container,
  FullHeightContainer,
  MinHeightContainer,
} from '../components';
import { Header } from '../modules/layout/containers/Header';
import { Footer } from '../modules/layout/components/Footer';
import { StoryList } from '../modules/stories/components/StoryList';
import { UserContext } from '../context/UserContext';

const Title = styled.h2`
  ${tw`text-2xl font-bold mb-4`};
`;

export const Me = () => {
  const { loading, user } = useContext(UserContext);

  return (
    <FullHeightContainer>
      <Header />
      <MinHeightContainer>
        <Container>
          <MeContainer>
            <Title>My Stories</Title>

            {loading && <p>Loading ...</p>}
            {!loading && user && <StoryList user={user} />}
            {/* TODO nice protected page */}
            {!loading && !user && <p>Protected</p>}
          </MeContainer>
        </Container>
        <Footer />
      </MinHeightContainer>
    </FullHeightContainer>
  );
};
