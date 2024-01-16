import { Button, Flex, IconButton } from '@radix-ui/themes';
import { IconCameraPlus, IconHandGrab, IconTrash } from '@tabler/icons-react';
import { MouseEventHandler, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { usePostHog } from 'posthog-js/react';
import { toast } from 'sonner';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { cn } from '@/lib/cn';
import { useUploadImage } from '@/hooks/use-upload-image';
import { Story } from '@/types';
import { LoadingSpinner } from '../ui/loading-spinner';
import { EditorPostFormData } from './editor-form-provider';

interface EditorCoverImageProps {
  story: Story;
}

export const EditorCoverImage = ({ story }: EditorCoverImageProps) => {
  const postId = story.id;
  const posthog = usePostHog();
  const [preview, setPreview] = useState<string | null>(null);
  const { setValue, watch } = useFormContext<EditorPostFormData>();
  const watchCoverImage = watch('coverImage');
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
          setValue('coverImage', data.url);
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
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: 'image/jpeg,image/png',
  });

  const onRemove: MouseEventHandler<HTMLButtonElement> = (e) => {
    // Prevent the form from submitting
    e.preventDefault();
    e.stopPropagation();
    setValue('coverImage', undefined);
    posthog.capture('cover_image_removed', {
      postId,
    });
  };

  const resolvedWatchCoverImage = watchCoverImage
    ? resolveImageUrl(watchCoverImage)
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
        className={isDragActive ? 'w-full' : undefined}
      >
        {!preview && !resolvedWatchCoverImage ? (
          !isDragActive ? (
            <Button color="gray" variant="soft" onClick={open}>
              Add cover image <IconCameraPlus size={16} />
            </Button>
          ) : (
            <Button
              className="w-full animate-in fade-in zoom-in"
              size="4"
              color="gray"
              variant="outline"
            >
              Drop your cover image here <IconHandGrab size={16} />
            </Button>
          )
        ) : (
          <div className="relative">
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
