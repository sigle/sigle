import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { StoryItem as Component } from '../components/StoryItem';
import { SubsetStory, BlockstackUser } from '../../../types';
import { publishStory, unPublishStory } from '../../../utils';

interface Props {
  user: BlockstackUser;
  story: SubsetStory;
  type: 'public' | 'private';
  onPublish: (storyId: string) => void;
  onUnPublish: (storyId: string) => void;
}

export const StoryItem = ({
  user,
  story,
  type,
  onPublish,
  onUnPublish,
}: Props) => {
  // TODO handle delete function
  // TODO remove the following code
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    setLoading(true);
    try {
      await publishStory(story.id);
      onPublish(story.id);
      toast.success('Story published');
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleUnPublishStory = async () => {
    setLoading(true);
    try {
      await unPublishStory(story.id);
      onUnPublish(story.id);
      toast.success('Story unpublished');
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    setLoading(false);
  };

  return <Component user={user} story={story} type={type} />;
};
