import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { StorySettings as Component } from '../components/StorySettings';
import { Story } from '../../../types';
import {
  getStoriesFile,
  saveStoriesFile,
  deleteStoryFile,
  history,
} from '../../../utils';

interface Props {
  story: Story;
  open: boolean;
  onClose: () => void;
}

export const StorySettings = ({ story, open, onClose }: Props) => {
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDelete = async () => {
    try {
      const result = confirm('Do you really want to delete this story?');
      if (!result) {
        return;
      }

      setLoadingDelete(true);
      const file = await getStoriesFile();
      const index = file.stories.findIndex(s => s.id === story.id);
      if (index === -1) {
        throw new Error('File not found in list');
      }
      file.stories.splice(index, 1);
      await saveStoriesFile(file);
      await deleteStoryFile(story);

      history.push(`/`);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setLoadingDelete(false);
    }
  };

  return (
    <Component
      story={story}
      open={open}
      onClose={onClose}
      loadingDelete={loadingDelete}
      onDelete={handleDelete}
    />
  );
};
