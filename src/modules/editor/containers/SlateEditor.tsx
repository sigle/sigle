import React, { useState } from 'react';
import { useWindowSize } from 'the-platform';
import { toast } from 'react-toastify';
import { SlateEditor as Component } from '../components/SlateEditor';
import { Story } from '../../../types';
import {
  getStoriesFile,
  saveStoriesFile,
  deleteStoryFile,
  history,
} from '../../../utils';

interface Props {
  story: Story;
}

export const SlateEditor = ({ story }: Props) => {
  const { width } = useWindowSize();
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
      width={width}
      story={story}
      loadingDelete={loadingDelete}
      onDelete={handleDelete}
    />
  );
};
