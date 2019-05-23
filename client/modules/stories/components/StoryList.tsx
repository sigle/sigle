import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { PrivateStory, PublicStory } from '../../../models';
import { StoryItem } from './StoryItem';

const Tabs = styled.div`
  ${tw`flex mb-8`};
`;

const Tab = styled.div<{ active: boolean }>`
  ${tw`cursor-pointer pb-1`};
  &:first-child {
    ${tw`mr-8`};
  }

  ${props =>
    props.active &&
    css`
      ${tw`border-b border-solid border-black font-medium`};
    `}
`;

const StoryListContainer = styled.div`
  ${tw`border-t border-solid border-grey`};
`;

export const StoryList = () => {
  // TODO error state
  const [tab, setTab] = useState(0);
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

      // TODO nice notify
      alert('Story deleted successfully');
    } catch (error) {
      // TODO notify user with error message
      alert(error.message);
    }
  };

  const publishStory = () => {
    alert('TODO');
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
    <React.Fragment>
      <Tabs>
        <Tab active={tab === 0} onClick={() => setTab(0)}>
          Draft ({loading ? '...' : stories.length})
        </Tab>
        <Tab active={tab === 1} onClick={() => setTab(1)}>
          Published (5)
        </Tab>
      </Tabs>

      <StoryListContainer>
        {stories.map((story: any) => (
          <StoryItem
            key={story.attrs._id}
            story={story}
            onDelete={deleteStory}
            onPublish={publishStory}
          />
        ))}
      </StoryListContainer>
    </React.Fragment>
  );
};
