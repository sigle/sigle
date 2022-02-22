import React, { useState, useCallback } from 'react';
import { useFormik, FormikErrors } from 'formik';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { MdAddAPhoto } from 'react-icons/md';
import format from 'date-fns/format';
import isValid from 'date-fns/isValid';
import { Story } from '../../../types';
import { resizeImage } from '../../../utils/image';
import {
  getStoriesFile,
  saveStoriesFile,
  deleteStoryFile,
} from '../../../utils';
import { Button } from '../../../ui/Button';
import { storage } from '../../../utils/blockstack';
import {
  FormHelper,
  FormHelperError,
  FormInput,
  FormInputCheckbox,
  FormLabel,
  FormRow,
  FormTextarea,
} from '../../../ui/Form';
import { styled } from '../../../stitches.config';
import { FileTextIcon, TrashIcon } from '@radix-ui/react-icons';
import { Box, Flex, IconButton, Text } from '../../../ui';
import {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '../../../ui/ScrollArea';
import Image from 'next/image';

const ImageEmpty = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$gray3',
  py: '$4',
  cursor: 'pointer',
  borderRadius: '$1',
  position: 'relative',
  overflow: 'hidden',

  '& span': {
    py: '$1',
    px: '$2',
    fontSize: '$1',
    color: '$gray9',
  },
});

const ImageEmptyIconContainer = styled('div', {
  position: 'absolute',
  bottom: '$1',
  right: '$1',
  display: 'flex',
  alignItems: 'center',
  color: '$gray9',
  gap: '$1',
});

const ImageCheckboxContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',

  [`& ${FormHelper}`]: {
    mt: 0,
    ml: '$2',
  },
});

const SaveRow = styled('div', {
  pt: '$5',
  pb: '$10',
  display: 'flex',
  justifyContent: 'end',
  gap: '$6',
});

const PreviewCard = styled('div', {
  mb: '$5',
  boxShadow: '0 0 0 1px $colors$gray6',
  borderRadius: '$4',
  overflow: 'hidden',
  //position: 'relative',

  '& img': {
    maxHeight: 186,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    objectFit: 'cover',
    objectPosition: 'top',
  },
});

const PreviewCardNoImage = styled('div', {
  display: 'flex',
  minHeight: 80,
  mb: '$5',
  boxShadow: '0 0 0 1px $colors$gray6',
  borderRadius: '$4',
  overflow: 'hidden',
});

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
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
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
    <>
      <Box
        as="form"
        css={{
          height: '100%',
          overflow: 'auto',
        }}
        onSubmit={formik.handleSubmit}
      >
        <ScrollArea type="scroll" scrollHideDelay={300}>
          <ScrollAreaViewport>
            <Box
              css={{
                px: '$8',
              }}
            >
              <FormRow>
                <FormLabel>Cover image</FormLabel>{' '}
                <ImageEmpty
                  {...getRootProps({ tabIndex: undefined })}
                  css={{
                    py: !!coverImageUrl ? 0 : undefined,
                    height: !!coverImageUrl ? undefined : 178,
                  }}
                >
                  {coverImageUrl && (
                    <Image src={coverImageUrl} layout="fill" alt="Meta image" />
                  )}
                  {!coverImageUrl && <span>Upload cover image</span>}
                  <input {...getInputProps()} />
                  <ImageEmptyIconContainer>
                    {!coverImageUrl ? (
                      <IconButton
                        css={{ backgroundColor: '$gray3', opacity: '70%' }}
                        size="sm"
                        title="Add cover image"
                      >
                        <MdAddAPhoto />
                      </IconButton>
                    ) : (
                      <IconButton
                        css={{ backgroundColor: '$gray3', opacity: '70%' }}
                        title="Remove cover image"
                        size="sm"
                        onClick={handleRemoveCover}
                      >
                        <TrashIcon />
                      </IconButton>
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
                  <FormHelper css={{ ml: '$2', pt: '$2' }}>
                    Hide cover image on the published story
                  </FormHelper>
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
                  placeholder="Type here..."
                  name="metaTitle"
                  type="text"
                  value={formik.values.metaTitle}
                  onChange={formik.handleChange}
                  maxLength={100}
                />
                <FormHelper>
                  Recommended: 70 characters. <br /> You have used{' '}
                  {formik.values.metaTitle.length} characters.
                </FormHelper>
                {formik.errors.metaTitle && (
                  <FormHelperError>{formik.errors.metaTitle}</FormHelperError>
                )}
              </FormRow>

              <FormRow>
                <FormLabel>Meta description</FormLabel>
                <FormTextarea
                  placeholder="Type here..."
                  name="metaDescription"
                  value={formik.values.metaDescription}
                  onChange={formik.handleChange}
                  rows={3}
                  maxLength={250}
                />
                <FormHelper>
                  Recommended: 156 characters. <br /> You have used{' '}
                  {formik.values.metaDescription.length} characters.
                </FormHelper>
                {formik.errors.metaDescription && (
                  <FormHelperError>
                    {formik.errors.metaDescription}
                  </FormHelperError>
                )}
              </FormRow>

              <Text css={{ mb: '$3' }}>Preview</Text>
              {coverImageUrl ? (
                <PreviewCard>
                  <Image layout="fill" src={coverImageUrl} alt="Meta image" />
                  <Box css={{ p: '$2' }}>
                    <Text size="xs" css={{ display: 'flex', gap: '$1' }}>
                      app.sigle.io
                    </Text>
                    <Text as="h3" css={{ fontWeight: 600 }}>
                      {story.metaTitle
                        ? story.metaTitle
                        : story.title + ' | Sigle'}
                    </Text>
                    {story.metaDescription && (
                      <Text size="xs" css={{ mb: '$1' }}>
                        {story.metaDescription}
                      </Text>
                    )}
                  </Box>
                </PreviewCard>
              ) : (
                <PreviewCardNoImage>
                  <Box
                    css={{
                      display: 'grid',
                      placeItems: 'center',
                      width: 75,
                      backgroundColor: '$gray3',
                      borderRight: '1px solid $colors$gray7',

                      '& svg': {
                        color: '$gray9',
                      },
                    }}
                  >
                    <FileTextIcon />
                  </Box>
                  <Flex direction="column" justify="center" css={{ p: '$2' }}>
                    <Text size="xs" css={{ display: 'flex', gap: '$1' }}>
                      app.sigle.io
                    </Text>
                    <Text as="h3" css={{ fontWeight: 600 }}>
                      {story.metaTitle
                        ? story.metaTitle
                        : story.title + ' | Sigle'}
                    </Text>
                    {story.metaDescription && (
                      <Text size="xs" css={{ mb: '$1' }}>
                        {story.metaDescription}
                      </Text>
                    )}
                  </Flex>
                </PreviewCardNoImage>
              )}
            </Box>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical">
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
          <ScrollAreaCorner />
        </ScrollArea>

        <Box
          css={{
            borderTop: '1px solid $colors$gray6',
            boxShadow: 'inset 1px 0 0 0 $colors$gray7',
            position: 'fixed',
            width: '100%',
            left: 0,
            bottom: 0,
            px: '$8',
            backgroundColor: '$gray1',
          }}
        >
          <SaveRow>
            {loadingDelete ? (
              <Button variant="ghost" color="orange" size="lg" disabled>
                <TrashIcon />
                <span>Deleting ...</span>
              </Button>
            ) : (
              <Button
                css={{ display: 'flex', gap: '$2' }}
                size="lg"
                onClick={handleDelete}
                variant="ghost"
                color="orange"
              >
                <span>Delete this story</span>
                <TrashIcon />
              </Button>
            )}
            <Button
              size="lg"
              color="orange"
              disabled={formik.isSubmitting}
              type="submit"
            >
              {formik.isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </SaveRow>
        </Box>
      </Box>

      <Box
        css={{
          height: 107.5,
        }}
      />
    </>
  );
};
