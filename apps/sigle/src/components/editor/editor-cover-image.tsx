import { Button, Flex, IconButton } from '@radix-ui/themes';
import { IconCameraPlus, IconHandGrab, IconTrash } from '@tabler/icons-react';
import { MouseEventHandler, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { usePostHog } from 'posthog-js/react';
import { toast } from 'sonner';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { cn } from '@/lib/cn';
import { useUploadImage } from '@/hooks/use-upload-image';
import { Story } from '@/types';
import { LoadingSpinner } from '../ui/loading-spinner';

interface EditorCoverImageProps {
  story: Story;
  setStoryFile: (story: Story) => void;
}

export const EditorCoverImage = ({
  story,
  setStoryFile,
}: EditorCoverImageProps) => {
  const postId = story.id;
  const posthog = usePostHog();
  const [preview, setPreview] = useState<string | null>(null);
  const { mutate: uploadImage, isLoading: loadingUploadImage } =
    useUploadImage();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (loadingUploadImage) return;

    const previewBlobUrl = URL.createObjectURL(file);
    setPreview(previewBlobUrl);

    posthog.capture('cover_image_upload_start', {
      postId,
    });
    const now = new Date().getTime();
    const path = `photos/${postId}/${now}-${file.name}`;
    uploadImage(
      {
        file,
        path,
        maxWidth: 2000,
      },
      {
        onSuccess: (data) => {
          URL.revokeObjectURL(previewBlobUrl);
          setStoryFile({ ...story, coverImage: data.url });
          setPreview(null);
          posthog.capture('cover_image_upload_success', {
            postId,
          });
        },
        onError: (error) => {
          posthog.capture('cover_image_upload_error', {
            postId,
          });
          toast.error(error);
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    multiple: false,
  });

  const onRemove: MouseEventHandler<HTMLButtonElement> = (e) => {
    // Prevent the form from submitting
    e.preventDefault();
    e.stopPropagation();
    setStoryFile({ ...story, coverImage: undefined });
    posthog.capture('cover_image_removed', {
      postId,
    });
  };

  const resolvedWatchCoverImage = story.coverImage
    ? resolveImageUrl(story.coverImage)
    : null;

  return (
    <Flex
      className="not-prose mt-6"
      justify={preview || resolvedWatchCoverImage ? 'center' : 'start'}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{ delay: 0.1 }}
        key={!preview && !resolvedWatchCoverImage ? 'button' : 'image'}
      >
        {!preview && !resolvedWatchCoverImage ? (
          !isDragActive ? (
            <Button color="gray" variant="soft" onClick={open}>
              Add cover image <IconCameraPlus size={16} />
            </Button>
          ) : (
            <Button color="gray" variant="outline">
              Drop your cover image here <IconHandGrab size={16} />
            </Button>
          )
        ) : (
          <div className="relative mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview || resolvedWatchCoverImage || ''}
              className={cn('rounded-2', {
                ['opacity-25']: loadingUploadImage,
              })}
              alt="Cover image"
            />
            {!loadingUploadImage ? (
              <div className="absolute right-2 top-2">
                <IconButton
                  size="3"
                  color="gray"
                  highContrast
                  onClick={onRemove}
                >
                  <IconTrash size={16} />
                </IconButton>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            )}
          </div>
        )}
      </motion.div>
    </Flex>
  );
};
