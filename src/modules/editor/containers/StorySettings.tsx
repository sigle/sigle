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
import { userSession } from '../../../utils/blockstack';

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
  const [loadingSave, setLoadingSave] = useState(false);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log('handleSubmit');
    event.preventDefault();
    setLoadingSave(true);

    try {
      if (coverFile) {
        const now = new Date().getTime();
        const name = `photos/${story.id}/${now}-${coverFile.name}`;
        const coverImageUrl = await userSession.putFile(
          name,
          coverFile as any,
          {
            // TODO encrypt if it's a draft or show a message to the user explaining the limitation
            encrypt: false,
            contentType: coverFile.type,
          }
        );
        console.log(coverImageUrl);
        onChangeStoryField('coverImage', coverImageUrl);
      }

      // TODO

      toast.success('Settings changed successfully');
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }

    setLoadingSave(false);
  };

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
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
      loadingSave={loadingSave}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      onChangeMetaTitle={handleChangeMetaTitle}
      onChangeMetaDescription={handleChangeMetaDescription}
      onChangeCreatedAt={handleChangeCreatedAt}
    />
  );
};
