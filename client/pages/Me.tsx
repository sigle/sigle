import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Container, Link } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { StoryItem } from '../modules/stories/components/StoryItem';

const MeContainer = styled.div`
  ${tw`flex flex-wrap`};
`;

// TODO active style
const MeMenu = styled.ul`
  ${tw`w-full lg:w-1/4 flex justify-around lg:flex-col py-6`};

  a {
    ${tw`py-2 px-2 block`};
  }
`;

const MeRight = styled.div`
  ${tw`w-full lg:w-3/4 bg-grey-light py-6 px-6`};
`;

const MeProfile = styled.div`
  ${tw`lg:flex lg:items-center mb-8`};

  img {
    ${tw`w-32 h-32 rounded-full mb-2 lg:mb-0 lg:mr-4`};
  }

  h2 {
    ${tw`text-2xl font-bold`};
  }

  p {
    ${tw`lg:text-sm`};
  }
`;

const MeTabs = styled.div`
  ${tw`flex mb-8`};

  div {
    ${tw`cursor-pointer pb-1`};
  }
  div:first-child {
    ${tw`mr-8`};
  }

  .active {
    ${tw`border-b border-solid border-black font-medium`};
  }
`;

const MeList = styled.div`
  ${tw`border-t border-solid border-grey`};
`;

// TODO protect this page, user needs to be connected
export const Me = () => (
  <React.Fragment>
    <Header />
    <Container>
      <MeContainer>
        <MeMenu>
          <li>
            <Link href="/me">My stories</Link>
          </li>
          <li>
            <Link href="/me/stats">Stats</Link>
          </li>
          <li>
            <Link href="/me/settings">Settings</Link>
          </li>
        </MeMenu>

        <MeRight>
          <MeProfile>
            <img src="https://source.unsplash.com/random/100x100" alt="TODO" />
            <div>
              <h2>John Doe</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam
                quis accumsan arcu.
              </p>
            </div>
          </MeProfile>

          <MeTabs>
            <div className="active">Draft (2)</div>
            <div>Published (5)</div>
          </MeTabs>

          <MeList>
            <StoryItem />
            <StoryItem />
            <StoryItem />
            <StoryItem />
            <StoryItem />
          </MeList>
        </MeRight>
      </MeContainer>
    </Container>
    <Footer />
  </React.Fragment>
);
