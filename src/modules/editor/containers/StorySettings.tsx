import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { StorySettings as Component } from '../components/StorySettings';
import { Story } from '../../../types';
import {
  getStoriesFile,
  saveStoriesFile,
  deleteStoryFile,
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
  const router = useRouter();
  const nodeRef = React.createRef<HTMLDivElement>();
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleUploadImage = () => {
    const src = window.prompt('Enter the URL of the image:');
    if (!src) return;
    onChangeStoryField('coverImage', src);
  };

  const handleChangeMetaTitle = (value: string) => {
    onChangeStoryField('metaTitle', value);
  };

  const handleChangeMetaDescription = (value: string) => {
    onChangeStoryField('metaDescription', value);
  };

  const handleChangeCreatedAt = (value: string) => {
    if (value) {
      onChangeStoryField('createdAt', new Date(value).getTime());
    }
  };

  const handleDelete = async () => {
    try {
      const result = window.confirm('Do you really want to delete this story?');
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
      router.push(`/`);
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
    // eslint-disable-next-line
  }, [open]);

  return (
    <Component
      story={story}
      open={open}
      onClose={onClose}
      loadingDelete={loadingDelete}
      onDelete={handleDelete}
      onChangeMetaTitle={handleChangeMetaTitle}
      onChangeMetaDescription={handleChangeMetaDescription}
      onChangeCreatedAt={handleChangeCreatedAt}
      onUploadImage={handleUploadImage}
      nodeRef={nodeRef}
    />
  );
};
