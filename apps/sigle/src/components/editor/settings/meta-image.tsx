import { useFormContext } from 'react-hook-form';
import { useUploadImage } from '@/hooks/use-upload-image';
import { EditorPostFormData } from '../editor-form-provider';
import { MouseEventHandler, useCallback, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { Card, Text, Tooltip } from '@radix-ui/themes';
import { cn } from '@/lib/cn';
import { IconCameraPlus, IconHelpCircle } from '@tabler/icons-react';

export const MetaImage = () => {
  const params = useParams<{ storyId: string }>();
  const postId = params!.storyId;
  const posthog = usePostHog();
  const [preview, setPreview] = useState<string | null>(null);
  const { setValue, watch } = useFormContext<EditorPostFormData>();
  const watchMetaImage = watch('metaImage');
  const { mutate: uploadImage, isLoading: loadingUploadImage } =
    useUploadImage();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (loadingUploadImage) return;

    const previewBlobUrl = URL.createObjectURL(file);
    setPreview(previewBlobUrl);

    posthog.capture('meta_image_upload_start', {
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
          setValue('metaImage', data.url);
          setPreview(null);
          posthog.capture('meta_image_upload_success', {
            postId,
          });
        },
        onError: (error) => {
          posthog.capture('meta_image_upload_error', {
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
    setValue('metaImage', undefined);
    posthog.capture('meta_image_removed', {
      postId,
    });
  };

  const resolvedWatchMetaImage = watchMetaImage
    ? resolveImageUrl(watchMetaImage)
    : null;

  return (
    <div className="flex flex-col">
      <Text
        className="flex items-center gap-1"
        as="p"
        size="3"
        mb="1"
        color="gray"
        highContrast
        weight="medium"
      >
        Meta image
        <Text color="gray">
          <Tooltip
            delayDuration={250}
            content="The image that will be used when sharing on social media, if no cover image is set"
          >
            <IconHelpCircle size={16} />
          </Tooltip>
        </Text>
      </Text>

      <Card
        className={cn('cursor-pointer bg-gray-2', {
          ['h-[180px]']: !preview && !resolvedWatchMetaImage,
        })}
        size="1"
        asChild
      >
        <button {...getRootProps()}>
          <div className="h-full flex items-center justify-center">
            <input {...getInputProps()} />
            <Text
              className="flex items-center gap-1"
              as="p"
              size="2"
              color="gray"
            >
              Add a custom meta image
              <IconCameraPlus size={16} />
            </Text>
          </div>
        </button>
      </Card>
    </div>
  );
};
