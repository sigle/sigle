'use client';

import { cn } from '@/lib/cn';
import { Button, Flex, IconButton, Spinner } from '@radix-ui/themes';
import { IconCameraPlus, IconHandGrab, IconTrash } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { type MouseEventHandler, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { EditorPostFormData } from './EditorFormProvider';
import { sigleApiClient } from '@/__generated__/sigle-api';
import { resolveImageUrl } from '@/lib/images';

export const EditorCoverImage = () => {
  const params = useParams();
  const postId = params.postId as string;
  const posthog = usePostHog();
  const [preview, setPreview] = useState<string | null>(null);
  const { setValue, watch } = useFormContext<EditorPostFormData>();
  const watchCoverImage = watch('coverImage');
  const { mutateAsync: uploadMedia, isPending: loadingUploadImage } =
    sigleApiClient.useMutation(
      'post',
      '/api/protected/drafts/{draftId}/upload-media',
    );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (loadingUploadImage) return;

    const previewBlobUrl = URL.createObjectURL(file);
    setPreview(previewBlobUrl);

    posthog.capture('cover_image_upload_start', {
      postId,
    });
    const formData = new FormData();
    formData.append('file', file);
    uploadMedia(
      {
        params: {
          path: {
            draftId: postId,
          },
        },
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        body: formData as any,
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
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        onError: (error: any) => {
          posthog.capture('cover_image_upload_error', {
            postId,
          });
          toast.error(error?.message);
        },
      },
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
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
    <Flex mt="4" {...getRootProps()}>
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
            <img
              src={preview || resolvedWatchCoverImage || ''}
              className={cn('rounded-2', {
                'opacity-25': loadingUploadImage,
              })}
              alt="Cover post"
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
                <Spinner />
              </div>
            )}
          </div>
        )}
      </motion.div>
    </Flex>
  );
};
