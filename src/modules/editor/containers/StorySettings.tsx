import React, { useState, useEffect } from 'react';
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
  onChangeStoryField: (field: string, value: any) => void;
}

export const StorySettings = ({
  story,
  open,
  onClose,
  onChangeStoryField,
}: Props) => {
  const nodeRef = React.createRef<HTMLDivElement>();
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleUploadImage = () => {
    const src = window.prompt('Enter the URL of the image:');
    if (!src) return;
    onChangeStoryField('coverImage', src);
  };

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

  /**
   * Handle click outside the settings
   */
  const handleClick = (e: any) => {
    if (nodeRef.current && !nodeRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  return (
    <Component
      story={story}
      open={open}
      onClose={onClose}
      loadingDelete={loadingDelete}
      onDelete={handleDelete}
      onUploadImage={handleUploadImage}
      nodeRef={nodeRef}
    />
  );
};
