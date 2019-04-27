import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { PrivateStory } from '../../../models';
import { StoryItem } from './StoryItem';

const StoryListContainer = styled.div`
  ${tw`border-t border-solid border-grey`};
`;

export const StoryList = () => {
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
    <StoryListContainer>
      {stories.map((story: any) => (
        <StoryItem key={story.attrs._id} story={story} />
      ))}
    </StoryListContainer>
  );
};
