import React, { useState, useCallback } from 'react';
import { useFormik, FormikErrors } from 'formik';
import { useRouter } from 'next/router';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { MdAddAPhoto, MdDelete } from 'react-icons/md';
import format from 'date-fns/format';
import isValid from 'date-fns/isValid';
import { Story } from '../../../types';
import { resizeImage } from '../../../utils/image';
import {
  getStoriesFile,
  saveStoriesFile,
  deleteStoryFile,
} from '../../../utils';
import { Button } from '../../../components';
import {
  FormRow,
  FormLabel,
  FormInput,
  FormInputCheckbox,
  FormHelper,
  FormTextarea,
  FormHelperError,
} from '../../../components/Form';
import { storage } from '../../../utils/blockstack';

const ImageEmpty = styled.div<{ haveImage: boolean }>`
  ${tw`flex items-center justify-center bg-grey py-16 mb-4 cursor-pointer rounded-lg relative border border-solid border-grey focus:outline-none`};

  ${(props) =>
    props.haveImage &&
    css`
      ${tw`py-0`};
    `}

  span {
    ${tw`py-1 px-2 text-sm text-grey-darker`};
  }
`;

const ImageEmptyIconContainer = styled.div`
  ${tw`absolute bottom-2 right-2 flex items-center text-gray-900`};
`;

const ImageEmptyIconAdd = styled.div`
  ${tw`p-2 bg-white rounded-full`};
`;

const ImageEmptyIconDelete = styled.div`
  ${tw`p-2 bg-white rounded-full ml-2`};
`;

const ImageCheckboxContainer = styled.div`
  ${tw`flex items-center`};

  ${FormHelper} {
    margin-top: 0;
    ${tw`ml-2`};
  }
`;

const Image = styled.img`
  ${tw`cursor-pointer w-full`};
`;

const SaveRow = styled.div`
  ${tw`py-3 flex justify-between`};
`;

const ButtonLink = styled.button`
  ${tw`flex items-center text-pink text-sm mt-2`};
  &:focus {
    outline: 0;
  }

  span {
    ${tw`ml-1`};
  }
`;

interface StorySettingsFormValues {
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  createdAt: string | number;
  hideCoverImage: boolean;
}

interface StorySettingsFormProps {
  story: Story;
  onSave: (storyParam?: Partial<Story>) => Promise<void>;
}

export const StorySettingsForm = ({
  story,
  onSave,
}: StorySettingsFormProps) => {
  const router = useRouter();
  const [coverFile, setCoverFile] = useState<
    (Blob & { preview: string; name: string }) | undefined
  >();
  const [loadingDelete, setLoadingDelete] = useState(false);

  const formik = useFormik<StorySettingsFormValues>({
    initialValues: {
      coverImage: story.coverImage || '',
      metaTitle: story.metaTitle || '',
      metaDescription: story.metaDescription || '',
      createdAt: format(story.createdAt, 'yyyy-MM-dd'),
      hideCoverImage: story.hideCoverImage ? true : false,
    },
    validate: (values) => {
      const errors: FormikErrors<StorySettingsFormValues> = {};
      if (values.metaTitle && values.metaTitle.length > 100) {
        errors.metaTitle = 'Meta title too long';
      }
      if (values.metaDescription && values.metaDescription.length > 250) {
        errors.metaDescription = 'Meta description too long';
      }
      if (!values.createdAt || !isValid(new Date(values.createdAt))) {
        errors.createdAt = 'Invalid date';
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      const updatedStory: Partial<Story> = {};
      (Object.keys(values) as Array<keyof typeof values>).forEach((key) => {
        // We replace empty strings by undefined
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        updatedStory[key] = values[key] ? values[key] : undefined;
      });

      if (updatedStory.createdAt) {
        const newDate = new Date(updatedStory.createdAt);
        // Set the time to midnight
        newDate.setHours(0, 0, 0, 0);
        // We normalize the date to save it as number
        updatedStory.createdAt = newDate.getTime();
      }

      if (coverFile) {
        const now = new Date().getTime();
        const name = `photos/${story.id}/${now}-${coverFile.name}`;
        const coverImageUrl = await storage.putFile(name, coverFile as any, {
          encrypt: false,
          contentType: coverFile.type,
        });
        updatedStory.coverImage = coverImageUrl;
      }

      await onSave(updatedStory);

      if (coverFile) {
        formik.setFieldValue('coverImage', updatedStory.coverImage);
        setCoverFile(undefined);
      }

      setSubmitting(false);
    },
  });

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

  const handleRemoveCover = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // We stop the event so it does not trigger react-dropzone
    event.stopPropagation();
    setCoverFile(undefined);
    formik.setFieldValue('coverImage', '');
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
      const index = file.stories.findIndex((s) => s.id === story.id);
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

  const coverImageUrl = coverFile
    ? coverFile.preview
    : formik.values.coverImage;

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormRow>
        <FormLabel>Cover image</FormLabel>
        <ImageEmpty
          {...getRootProps({ tabIndex: undefined })}
          haveImage={!!coverImageUrl}
        >
          {coverImageUrl && <Image src={coverImageUrl} />}
          {!coverImageUrl && <span>Upload cover image</span>}
          <input {...getInputProps()} />
          <ImageEmptyIconContainer>
            <ImageEmptyIconAdd title="Add cover image">
              <MdAddAPhoto size={15} />
            </ImageEmptyIconAdd>
            {coverImageUrl && (
              <ImageEmptyIconDelete
                title="Remove cover image"
                onClick={handleRemoveCover}
              >
                <MdDelete size={15} />
              </ImageEmptyIconDelete>
            )}
          </ImageEmptyIconContainer>
        </ImageEmpty>
        <ImageCheckboxContainer>
          <FormInputCheckbox
            type="checkbox"
            name="hideCoverImage"
            checked={formik.values.hideCoverImage}
            value={formik.values.hideCoverImage ? 'true' : 'false'}
            onChange={formik.handleChange}
          />
          <FormHelper>Hide cover image on the published story</FormHelper>
        </ImageCheckboxContainer>
      </FormRow>

      <FormRow>
        <FormLabel>Created on</FormLabel>
        <FormInput
          type="date"
          name="createdAt"
          value={formik.values.createdAt}
          onChange={formik.handleChange}
        />
        {formik.errors.createdAt && (
          <FormHelperError>{formik.errors.createdAt}</FormHelperError>
        )}
      </FormRow>

      <FormRow>
        <FormLabel>Meta title</FormLabel>
        <FormInput
          name="metaTitle"
          type="text"
          value={formik.values.metaTitle}
          onChange={formik.handleChange}
          maxLength={100}
        />
        <FormHelper>
          Recommended: 70 characters. You have used{' '}
          {formik.values.metaTitle.length} characters.
        </FormHelper>
        {formik.errors.metaTitle && (
          <FormHelperError>{formik.errors.metaTitle}</FormHelperError>
        )}
      </FormRow>

      <FormRow>
        <FormLabel>Meta description</FormLabel>
        <FormTextarea
          name="metaDescription"
          value={formik.values.metaDescription}
          onChange={formik.handleChange}
          rows={3}
          maxLength={250}
        />
        <FormHelper>
          Recommended: 156 characters. You have used{' '}
          {formik.values.metaDescription.length} characters.
        </FormHelper>
        {formik.errors.metaDescription && (
          <FormHelperError>{formik.errors.metaDescription}</FormHelperError>
        )}
      </FormRow>

      <SaveRow>
        <Button disabled={formik.isSubmitting} type="submit">
          {formik.isSubmitting ? 'Saving...' : 'Save'}
        </Button>

        {loadingDelete ? (
          <ButtonLink disabled>
            <MdDelete />
            <span>Deleting ...</span>
          </ButtonLink>
        ) : (
          <ButtonLink onClick={handleDelete}>
            <MdDelete />
            <span>Delete this story</span>
          </ButtonLink>
        )}
      </SaveRow>
    </form>
  );
};
