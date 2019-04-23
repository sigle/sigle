import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { config } from '../config';
import { Container, Link } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { StoryItem } from '../modules/stories/components/StoryItem';
import { PrivateStory } from '../models';

export const MeContainer = styled.div`
  ${tw`flex flex-wrap`};
`;

// TODO active style
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

const PrivateStoryList = () => {
  // TODO error state
  const [loading, setLoading] = useState<boolean>(true);
  const [stories, setStories] = useState<any | undefined>();

  const fetchStories = async () => {
    // TODO sort by created at and updated at
    const privateStories = await PrivateStory.fetchOwnList();
    console.log(privateStories);
    setStories(privateStories);
    setLoading(false);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  if (loading) {
    // TODO nice loading
    return <div>Loading ...</div>;
  }

  if (stories.length === 0) {
    // TODO empty list state
    return <div>No stories found</div>;
  }

  return (
    <MeList>
      {stories.map(story => (
        <StoryItem key={story.attrs._id} story={story} />
      ))}
    </MeList>
  );
};

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

          <PrivateStoryList />
        </MeRight>
      </MeContainer>
    </Container>
    <Footer />
  </React.Fragment>
);
