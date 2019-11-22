import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
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
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [coverFile, setCoverFile] = useState<File | undefined>();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setCoverFile(
        Object.assign(file, {
          // Create a preview so we can display it
          preview: URL.createObjectURL(file),
        })
      );
    }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/jpeg, image/png',
    multiple: false,
  });

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

  return (
    <Component
      story={story}
      open={open}
      onClose={onClose}
      loadingDelete={loadingDelete}
      getRootProps={getRootProps}
      getInputProps={getInputProps}
      coverFile={coverFile}
      onDelete={handleDelete}
      onChangeMetaTitle={handleChangeMetaTitle}
      onChangeMetaDescription={handleChangeMetaDescription}
      onChangeCreatedAt={handleChangeCreatedAt}
    />
  );
};
