import React, { useCallback, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  CameraIcon,
  Cross1Icon,
  FileTextIcon,
  QuestionMarkCircledIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { useFormik, FormikErrors } from 'formik';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import format from 'date-fns/format';
import isValid from 'date-fns/isValid';
import { fetchStoriesControllerDelete } from '@/__generated__/sigle-api';
import { Story } from '../../../types';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Flex,
  IconButton,
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
  Typography,
} from '../../../ui';
import { keyframes, styled } from '../../../stitches.config';
import { resizeImage } from '../../../utils/image';
import { storage } from '../../../utils/stacks';
import {
  deleteStoryFile,
  getStoriesFile,
  isValidHttpUrl,
  saveStoriesFile,
} from '../../../utils';
import {
  FormHelper,
  FormHelperError,
  FormInput,
  FormLabel,
  FormRow,
  FormTextarea,
} from '../../../ui/Form';

// TODO - migrate hideCoverImage from old articles
// TODO - use twitter card preview component in settings?

const StyledFormInput = styled(FormInput, {
  width: '100%',
});

const StyledFormTextarea = styled(FormTextarea, {
  width: '100%',
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
  canonicalUrl: string;
}

interface EditorSettingsProps {
  story: Story;
  setStoryFile: (story: Story) => void;
  open: boolean;
  onSave: ({}: { story: Story; toastPosition: 'top-left' }) => Promise<void>;
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
      canonicalUrl: story.canonicalUrl || '',
    },
    validate: (values) => {
      const errors: FormikErrors<StorySettingsFormValues> = {};
      if (values.metaTitle && values.metaTitle.length > 100) {
        errors.metaTitle = 'Meta title too long';
      }
      if (values.metaDescription && values.metaDescription.length > 250) {
        errors.metaDescription = 'Meta description too long';
      }
      if (values.canonicalUrl && !isValidHttpUrl(values.canonicalUrl)) {
        errors.canonicalUrl =
          'Invalid canonical URL entered (eg: https://example.com)';
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
        canonicalUrl: values.canonicalUrl ? values.canonicalUrl : undefined,
        metaImage: values.metaImage ? values.metaImage : undefined,
        createdAt: new Date(values.createdAt).getTime(),
      };

      if (updatedStory.createdAt) {
        const newDate = new Date(updatedStory.createdAt);
        // Set the time to midnight
        newDate.setHours(0, 0, 0, 0);
        // We normalize the date to save it as number
        updatedStory.createdAt = newDate.getTime();
      }

      setStoryFile(updatedStory);
      await onSave({ story: updatedStory, toastPosition: 'top-left' });
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
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    // We stop the event so it does not trigger react-dropzone
    event.stopPropagation();
    formik.setFieldValue('metaImage', '');
  };

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
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
      await fetchStoriesControllerDelete({
        body: { id: story.id },
      });
      router.push(`/`);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setLoadingDelete(false);
    }
  };

  const canonicalUrlInfo =
    'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <StyledDialogContent aria-label="Story settings">
        <DialogTitle asChild>
          <Typography
            as="h2"
            size="h3"
            css={{ ml: '$8', mt: '$10', pb: '$4', fontWeight: 'normal' }}
          >
            Story settings
          </Typography>
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
                  <StyledFormInput
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
                      width: '100%',
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
                        <Typography size="subheading" css={{ color: '$gray9' }}>
                          Add a custom meta image
                        </Typography>
                      </Flex>
                    )}
                    <input {...getInputProps()} />
                    <ImageEmptyIconContainer>
                      {formik.values.metaImage && (
                        <IconButton
                          size="sm"
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
                  <StyledFormInput
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
                  <StyledFormTextarea
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

                <FormRow>
                  <FormLabel>Canonical URL</FormLabel>
                  <StyledFormInput
                    placeholder="https://"
                    name="canonicalUrl"
                    type="text"
                    value={formik.values.canonicalUrl}
                    onChange={formik.handleChange}
                    maxLength={200}
                  />
                  <Flex gap="1" align="center">
                    <FormHelper>Add a canonical URL</FormHelper>
                    <Box
                      css={{ '& svg': { color: '$gray9' } }}
                      as="a"
                      href={canonicalUrlInfo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <QuestionMarkCircledIcon />
                    </Box>
                  </Flex>
                  {formik.errors.canonicalUrl && (
                    <FormHelperError>
                      {formik.errors.canonicalUrl}
                    </FormHelperError>
                  )}
                </FormRow>

                <Typography css={{ mb: '$3' }}>Preview</Typography>
                {formik.values.metaImage || story.coverImage ? (
                  <PreviewCard>
                    <Image
                      src={formik.values.metaImage || story.coverImage}
                      alt="Meta image"
                    />
                    <Box css={{ p: '$2' }}>
                      <Typography
                        size="subparagraph"
                        css={{ display: 'flex', gap: '$1' }}
                      >
                        app.sigle.io
                      </Typography>
                      <Typography as="h3" css={{ fontWeight: 600 }}>
                        {story.metaTitle
                          ? story.metaTitle
                          : story.title + ' | Sigle'}
                      </Typography>
                      {story.metaDescription && (
                        <Typography size="subparagraph" css={{ mb: '$1' }}>
                          {story.metaDescription}
                        </Typography>
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
                      <Typography
                        size="subparagraph"
                        css={{ display: 'flex', gap: '$1' }}
                      >
                        app.sigle.io
                      </Typography>
                      <Typography as="h3" css={{ fontWeight: 600 }}>
                        {story.metaTitle
                          ? story.metaTitle
                          : story.title + ' | Sigle'}
                      </Typography>
                      {story.metaDescription && (
                        <Typography size="subparagraph" css={{ mb: '$1' }}>
                          {story.metaDescription}
                        </Typography>
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
          <IconButton size="sm">
            <Cross1Icon width={15} height={15} />
          </IconButton>
        </StyledCloseButton>
      </StyledDialogContent>
    </Dialog>
  );
};
