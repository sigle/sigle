import { sigleApiClient } from "@/__generated__/sigle-api";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";
import { Avatar, Spinner, Text } from "@radix-ui/themes";
import { IconPencil } from "@tabler/icons-react";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface UploadProfilePictureProps {
  picture?: string;
  setPicture: (picture: string) => void;
}

export const UploadProfilePicture = ({
  picture,
  setPicture,
}: UploadProfilePictureProps) => {
  const posthog = usePostHog();
  const { mutate: uploadImage, isPending: loadingUploadImage } =
    sigleApiClient.useMutation(
      "post",
      "/api/protected/user/profile/upload-avatar",
    );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (loadingUploadImage) return;
    posthog.capture("profile_image_upload_start", {});

    const formData = new FormData();
    formData.append("file", file);
    uploadImage(
      {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        body: formData as any,
      },
      {
        onSuccess: (data) => {
          setPicture(data.url);
          posthog.capture("profile_image_upload_success", {});
        },
        onError: (error) => {
          posthog.capture("profile_image_upload_error", {});
          toast.error(error.message);
        },
      },
    );
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
  });

  const resolvedPicture = picture ? resolveImageUrl(picture) : undefined;

  return (
    <div className="space-y-1">
      <Text as="div" size="2">
        Profile Picture
      </Text>

      <div className="flex">
        <div className="relative cursor-pointer" {...getRootProps()}>
          <input {...getInputProps()} />
          <Avatar
            src={resolvedPicture}
            fallback={<IconPencil size={20} />}
            alt="Profile image"
            size="9"
            color="gray"
            className={cn("rounded-2 border border-gray-6", {
              "opacity-25": loadingUploadImage,
            })}
          />
          {loadingUploadImage ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
