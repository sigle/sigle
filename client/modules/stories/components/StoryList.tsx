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
    setStories(privateStories);
    setLoading(false);
  };

  const deleteStory = async (storyId: string) => {
    if (!stories) return;

    // TODO nice confirm
    const result = confirm('Do you really want to delete this story?');
    if (!result) {
      return;
    }

    try {
      const index = stories.findIndex(
        (story: any) => story.attrs._id === storyId
      );
      if (index === -1) {
        throw new Error('Story not found in list');
      }
      const story = stories[index];
      await story.destroy();

      stories.splice(index, 1);
      setStories([...stories]);
    } catch (error) {
      // TODO notify user with error message
    }
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
        <StoryItem key={story.attrs._id} story={story} onDelete={deleteStory} />
      ))}
    </StoryListContainer>
  );
};
