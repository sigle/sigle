import { IconPencil } from "@tabler/icons-react";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldTitle } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";
import { sigleApiClient } from "@/lib/sigle";

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

  // oxlint-disable-next-line exhaustive-deps
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (loadingUploadImage) return;
    posthog.capture("profile_image_upload_start", {});

    const formData = new FormData();
    formData.append("file", file);
    uploadImage(
      {
        // oxlint-disable-next-line no-explicit-any
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
    // oxlint-disable-next-line exhaustive-deps
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
    <Field>
      <FieldTitle>Profile Picture</FieldTitle>

      <div className="flex">
        <div className="relative cursor-pointer" {...getRootProps()}>
          <input {...getInputProps()} />
          <Avatar
            className={cn("h-40 w-40 border border-border", {
              "opacity-25": loadingUploadImage,
            })}
          >
            <AvatarImage src={resolvedPicture} alt="Profile image" />
            <AvatarFallback>
              <IconPencil size={20} />
            </AvatarFallback>
          </Avatar>
          {loadingUploadImage ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          ) : null}
        </div>
      </div>
    </Field>
  );
};
