import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { config } from '../config';
import { Container, Link } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { StoryList } from '../modules/stories/components/StoryList';

export const MeContainer = styled.div`
  ${tw`flex flex-wrap`};
`;

const MeMenu = styled.div`
  ${tw`w-full py-6`};

  @media (min-width: ${config.breakpoints.md}px) {
    width: 200px;
  }

  ul {
    ${tw`flex justify-around lg:flex-col sticky`};
    top: 0;
  }

  a {
    ${tw`py-2 block`};
  }

  .active span {
    ${tw`border-b border-solid border-black font-medium py-1`};
  }
`;

export const MeRight = styled.div`
  ${tw`w-full lg:w-3/4 bg-grey-light py-6 px-6`};

  @media (min-width: ${config.breakpoints.md}px) {
    width: calc(100% - 200px);
  }
`;

const Title = styled.h2`
  ${tw`text-2xl font-bold mb-4`};
`;

export const MeLeft = () => (
  <MeMenu>
    <ul>
      <li>
        <Link href="/me" className="active">
          <span>My stories</span>
        </Link>
      </li>
      <li>
        <Link href="/me/stats">
          <span>Stats</span>
        </Link>
      </li>
      <li>
        <Link href="/me/settings">
          <span>Settings</span>
        </Link>
      </li>
    </ul>
  </MeMenu>
);

// TODO protect this page, user needs to be connected
export const Me = () => (
  <React.Fragment>
    <Header />
    <Container>
      <MeContainer>
        <MeLeft />
        <MeRight>
          <Title>My Stories</Title>

          <StoryList />
        </MeRight>
      </MeContainer>
    </Container>
    <Footer />
  </React.Fragment>
);
