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

interface UploadProfileCoverPictureProps {
  picture?: string;
  setPicture: (picture: string) => void;
}

export const UploadProfileCoverPicture = ({
  picture,
  setPicture,
}: UploadProfileCoverPictureProps) => {
  const posthog = usePostHog();
  const { mutate: uploadImage, isPending: loadingUploadImage } =
    sigleApiClient.useMutation(
      "post",
      "/api/protected/user/profile/upload-cover",
    );

  // oxlint-disable-next-line exhaustive-deps
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (loadingUploadImage) return;
    posthog.capture("profile_cover_image_upload_start", {});

    const formData = new FormData();
    formData.append("file", file);
    uploadImage(
      {
        // oxlint-disable-next-line no-explicit-any: wrong type returned by nitro
        body: formData as any,
      },
      {
        onSuccess: (data) => {
          setPicture(data.url);
          posthog.capture("profile_cover_image_upload_success", {});
        },
        onError: (error) => {
          posthog.capture("profile_cover_image_upload_error", {});
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
      <FieldTitle>Profile Cover Picture</FieldTitle>

      <div className="flex">
        <div className="relative w-full cursor-pointer" {...getRootProps()}>
          <input {...getInputProps()} />
          <Avatar
            className={cn("h-60 w-full border border-border", {
              "opacity-25": loadingUploadImage,
            })}
          >
            <AvatarImage src={resolvedPicture} />
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
