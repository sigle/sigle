import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { useFormik, FormikErrors } from 'formik';
import { StorySettings as Component } from '../components/StorySettings';
import { Story } from '../../../types';
import {
  getStoriesFile,
  saveStoriesFile,
  deleteStoryFile,
} from '../../../utils';
import { userSession } from '../../../utils/blockstack';
import { resizeImage } from '../../../utils/image';

export interface StorySettingsValues {
  createdAt: number;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface Props {
  story: Story;
  open: boolean;
  onClose: () => void;
  onChangeStoryField: (field: string, value: any) => void;
  onSave: (storyParam?: Partial<Story>) => Promise<void>;
}

export const StorySettings = ({
  story,
  open,
  onClose,
  onChangeStoryField,
  onSave,
}: Props) => {
  const router = useRouter();
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [coverFile, setCoverFile] = useState<
    (Blob & { preview: string; name: string }) | undefined
  >();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const [mime] = file.type.split('/');
      if (mime !== 'image') {
        return;
      }

      const blob = await resizeImage(file, { maxWidth: 2000 });
      setCoverFile(
        Object.assign(blob as any, {
          name: file.name,
        })
      );
    }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/jpeg, image/png',
    multiple: false,
  });

  const formik = useFormik<StorySettingsValues>({
    initialValues: {
      createdAt: story.createdAt,
      slug: story.slug,
      metaTitle: story.metaTitle,
      metaDescription: story.metaDescription,
    },
    validate: values => {
      const errors: FormikErrors<StorySettingsValues> = {};
      // TODO slug should be unique
      if (values.slug && !values.slug.match(/^[a-z0-9-]+$/)) {
        errors.slug = 'Slug is containing invalid characters';
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let coverImageUrl = story.coverImage;
        if (coverFile) {
          const now = new Date().getTime();
          const name = `photos/${story.id}/${now}-${coverFile.name}`;
          coverImageUrl = await userSession.putFile(name, coverFile as any, {
            // TODO encrypt if it's a draft or show a message to the user explaining the limitation
            encrypt: false,
            contentType: coverFile.type,
          });
          onChangeStoryField('coverImage', coverImageUrl);
          setCoverFile(undefined);
        }

        await onSave({
          coverImage: coverImageUrl,
          createdAt: values.createdAt,
          slug: values.slug,
          metaTitle: values.metaTitle,
          metaDescription: values.metaDescription,
        });
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
      setSubmitting(false);
    },
  });

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
      formik={formik}
      onDelete={handleDelete}
    />
  );
};
