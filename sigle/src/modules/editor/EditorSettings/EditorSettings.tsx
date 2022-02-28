import React, { useCallback, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  CameraIcon,
  Cross1Icon,
  FileTextIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { useFormik, FormikErrors } from 'formik';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import format from 'date-fns/format';
import isValid from 'date-fns/isValid';
import { Story } from '../../../types';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
  Text,
} from '../../../ui';
import { keyframes, styled } from '../../../stitches.config';
import { resizeImage } from '../../../utils/image';
import { storage } from '../../../utils/blockstack';
import {
  deleteStoryFile,
  getStoriesFile,
  saveStoriesFile,
} from '../../../utils';

// TODO - migrate hideCoverImage from old articles
// TODO - use twitter card preview component in settings?

export const FormRow = styled('div', {
  mb: '$5',
});

export const FormLabel = styled('label', {
  width: '100%',
  display: 'block',
  fontSize: '$2',
  color: '$gray11',
  mb: '$3',
});

export const FormInput = styled('input', {
  '&[type]': {
    appearance: 'none',
    borderWidth: '0',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    margin: '0',
    outline: 'none',
    padding: '0',
    width: '100%',
    WebkitTapHighlightColor: 'rgba(0,0,0,0)',
    backgroundColor: '$gray3',
    boxShadow: '0 0 0 1px $colors$gray7',
    borderRadius: '$1',
    px: '$2',
    py: '$1',
    fontSize: '$1',
    color: '$gray11',

    '&:hover': {
      backgroundColor: '$gray4',
      boxShadow: '0 0 0 1px $colors$gray8',
    },

    '&:focus': {
      backgroundColor: '$gray5',
      boxShadow: '0 0 0 2px $colors$gray8',
    },

    '&::placeholder': {
      color: '$gray9',
    },
  },

  '&[type="date"]::-webkit-calendar-picker-indicator': {
    background: 'url(/static/img/Calendar.svg) no-repeat',
    mt: '$1',
  },
});

const FormTextarea = styled('textarea', {
  outline: 'none',
  width: '100%',
  backgroundColor: '$gray3',
  boxShadow: '0 0 0 1px $colors$gray7',
  borderRadius: '$1',
  py: '$2',
  px: '$2',
  fontSize: '$1',

  '&:hover': {
    backgroundColor: '$gray4',
    boxShadow: '0 0 0 1px $colors$gray8',
  },

  '&:focus': {
    backgroundColor: '$gray5',
    boxShadow: '0 0 0 2px $colors$gray8',
  },

  '&::placeholder': {
    color: '$gray9',
  },
});

const FormHelper = styled('p', {
  mt: '$2',
  color: '$gray9',
  fontSize: '$1',
});

const FormHelperError = styled('p', {
  mt: '$1',
  color: '$orange11',
});

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

const Image = styled('img', {
  width: '100%',
  variants: {
    loading: {
      true: {
        opacity: 0.75,
      },
    },
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

const SaveRow = styled('div', {
  py: '$5',
  display: 'flex',
  justifyContent: 'end',
  gap: '$6',
});

const PreviewCard = styled('div', {
  mb: '$5',
  boxShadow: '0 0 0 1px $colors$gray6',
  borderRadius: '$4',
  overflow: 'hidden',

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

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translateX(100%)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const StyledDialogContent = styled(DialogPrimitive.Content, {
  display: 'flex',
  flexDirection: 'column',
  transform: 'translateX(0)',
  maxWidth: '28rem',
  maxHeight: 'initial',
  overflow: 'hidden',
  width: '100%',
  backgroundColor: '$gray1',
  boxShadow: 'inset 1px 0 0 0 $colors$gray7',
  margin: 0,
  borderRadius: 0,
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${contentShow} 300ms ease-in-out`,
    willChange: 'translateX',
  },
});

const StyledCloseButton = styled(DialogPrimitive.Close, {
  position: 'absolute',
  top: '$9',
  right: '$6',
});

interface StorySettingsFormValues {
  metaTitle: string;
  metaDescription: string;
  metaImage: string;
  createdAt: string | number;
}

interface EditorSettingsProps {
  story: Story;
  setStoryFile: (story: Story) => void;
  open: boolean;
  onSave: ({}: { story: Story }) => Promise<void>;
  onClose: () => void;
}

export const EditorSettings = ({
  open,
  onClose,
  setStoryFile,
  story,
  onSave,
}: EditorSettingsProps) => {
  const router = useRouter();
  const [loadingUploadMetaImage, setLoadingUploadMetaImage] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const formik = useFormik<StorySettingsFormValues>({
    initialValues: {
      metaTitle: story.metaTitle || '',
      metaDescription: story.metaDescription || '',
      metaImage: story.metaImage || '',
      createdAt: format(story.createdAt, 'yyyy-MM-dd'),
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
      const updatedStory: Story = {
        ...story,
        metaTitle: values.metaTitle ? values.metaTitle : undefined,
        metaDescription: values.metaDescription
          ? values.metaDescription
          : undefined,
        metaImage: values.metaImage ? values.metaImage : undefined,
      };

      if (updatedStory.createdAt) {
        const newDate = new Date(updatedStory.createdAt);
        // Set the time to midnight
        newDate.setHours(0, 0, 0, 0);
        // We normalize the date to save it as number
        updatedStory.createdAt = newDate.getTime();
      }

      setStoryFile(updatedStory);
      await onSave({ story: updatedStory });
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
      setLoadingUploadMetaImage(true);
      formik.setFieldValue('metaImage', blob.preview);

      const now = new Date().getTime();
      const name = `photos/${story.id}/${now}-${file.name}`;
      const metaImageUrl = await storage.putFile(name, file, {
        encrypt: false,
        contentType: file.type,
      });
      setLoadingUploadMetaImage(false);
      formik.setFieldValue('metaImage', metaImageUrl);
    }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/jpeg,image/png',
    multiple: false,
  });

  const handleRemoveCover = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    // We stop the event so it does not trigger react-dropzone
    event.stopPropagation();
    formik.setFieldValue('metaImage', '');
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <StyledDialogContent aria-label="Story settings">
        <DialogTitle asChild>
          <Heading
            as="h2"
            size="lg"
            css={{ ml: '$8', mt: '$10', pb: '$4', fontWeight: 'normal' }}
          >
            Story settings
          </Heading>
        </DialogTitle>

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
                  <FormLabel>Meta image</FormLabel>{' '}
                  <ImageEmpty
                    {...getRootProps({ tabIndex: undefined })}
                    css={{
                      py: !!formik.values.metaImage ? 0 : undefined,
                      height: !!formik.values.metaImage ? undefined : 178,
                    }}
                  >
                    {formik.values.metaImage && (
                      <Image
                        src={formik.values.metaImage}
                        alt="Meta image"
                        loading={loadingUploadMetaImage}
                      />
                    )}
                    {!formik.values.metaImage && (
                      <Flex align="center" gap="1" css={{ color: '$gray9' }}>
                        <CameraIcon />
                        <Text size="action" css={{ color: '$gray9' }}>
                          Add a custom meta image
                        </Text>
                      </Flex>
                    )}
                    <input {...getInputProps()} />
                    <ImageEmptyIconContainer>
                      {formik.values.metaImage && (
                        <IconButton
                          css={{ backgroundColor: '$gray3', opacity: '70%' }}
                          title="Remove meta image"
                          onClick={handleRemoveCover}
                        >
                          <TrashIcon />
                        </IconButton>
                      )}
                    </ImageEmptyIconContainer>
                  </ImageEmpty>
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
                {formik.values.metaImage || story.coverImage ? (
                  <PreviewCard>
                    <Image
                      src={formik.values.metaImage || story.coverImage}
                      alt="Meta image"
                    />
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

        <StyledCloseButton asChild>
          <IconButton>
            <Cross1Icon width={15} height={15} />
          </IconButton>
        </StyledCloseButton>
      </StyledDialogContent>
    </Dialog>
  );
};
