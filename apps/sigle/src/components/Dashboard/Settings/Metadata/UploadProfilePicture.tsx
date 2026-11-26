import type { paths } from "@sigle/sdk";
import { IconUpload } from "@tabler/icons-react";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";
import { sigleApiClient } from "@/lib/sigle";

type UploadResponse =
  paths["/api/me/profile/images/{kind}"]["put"]["responses"][200]["content"]["application/json"];

interface UploadProfilePictureProps {
  picture?: string;
  /** Stores the profile the upload saved the image on. */
  onUploaded: (user: UploadResponse) => Promise<void>;
}

export const UploadProfilePicture = ({
  picture,
  onUploaded,
}: UploadProfilePictureProps) => {
  const posthog = usePostHog();

  const { mutate: uploadImage, isPending: loadingUploadImage } =
    sigleApiClient.useMutation("put", "/api/me/profile/images/{kind}");

  const onDrop = useCallback(
    async (acceptedFiles: Array<File>) => {
      const file = acceptedFiles[0];

      if (!file) {
        return;
      }

      if (loadingUploadImage) {
        return;
      }
      posthog.capture("profile_image_upload_start", {});

      // SAFETY: the endpoint reads a raw binary body, but openapi-typescript
      // models `format: binary` request bodies as strings. The file is passed
      // through `bodySerializer` unchanged.
      uploadImage(
        {
          params: {
            path: {
              kind: "avatar",
            },
          },
          headers: {
            "Content-Type": file.type,
          },
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion
          body: file as never,
          bodySerializer: () => file,
        },
        {
          onSuccess: async (data) => {
            await onUploaded(data);
            toast.success("Picture updated!");
            posthog.capture("profile_image_upload_success", {});
          },
          onError: (error) => {
            posthog.capture("profile_image_upload_error", {});
            toast.error(error.message);
          },
        },
      );
    },
    [posthog, uploadImage, onUploaded, loadingUploadImage],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
  });

  const resolvedPicture = picture ? resolveImageUrl(picture) : undefined;

  return (
    <div
      {...getRootProps()}
      className="group flex w-fit cursor-pointer items-center gap-4"
    >
      <input {...getInputProps()} />
      <div className="relative">
        <Avatar
          className={cn("size-16 border border-border", {
            "opacity-25": loadingUploadImage,
          })}
        >
          <AvatarImage src={resolvedPicture} alt="Profile image" />
          <AvatarFallback>
            <IconUpload size={18} className="text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        {loadingUploadImage ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        ) : null}
      </div>
      <span className="text-sm text-muted-foreground underline-offset-4 group-hover:text-foreground group-hover:underline">
        {resolvedPicture ? "Replace picture" : "Upload picture"}
      </span>
    </div>
  );
};
