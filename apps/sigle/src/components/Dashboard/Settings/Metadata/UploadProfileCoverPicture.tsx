import type { paths } from "@sigle/sdk";
import { IconUpload } from "@tabler/icons-react";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";
import { sigleApiClient } from "@/lib/sigle";

type UploadResponse =
  paths["/api/me/profile/images/{kind}"]["put"]["responses"][200]["content"]["application/json"];

interface UploadProfileCoverPictureProps {
  picture?: string;
  /** Stores the profile the upload saved the image on. */
  onUploaded: (user: UploadResponse) => Promise<void>;
}

export const UploadProfileCoverPicture = ({
  picture,
  onUploaded,
}: UploadProfileCoverPictureProps) => {
  const posthog = usePostHog();

  const { mutate: uploadImage, isPending: loadingUploadImage } =
    sigleApiClient.useMutation("put", "/api/me/profile/images/{kind}");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) {
        return;
      }

      if (loadingUploadImage) {
        return;
      }
      posthog.capture("profile_cover_image_upload_start", {});

      // SAFETY: the endpoint reads a raw binary body, but openapi-typescript
      // models `format: binary` request bodies as strings. The file is passed
      // through `bodySerializer` unchanged.
      uploadImage(
        {
          params: {
            path: {
              kind: "cover",
            },
          },
          headers: {
            "Content-Type": file.type,
          },
          body: file as never,
          bodySerializer: () => file,
        },
        {
          onSuccess: async (data) => {
            await onUploaded(data);
            toast.success("Cover updated!");
            posthog.capture("profile_cover_image_upload_success", {});
          },
          onError: (error) => {
            posthog.capture("profile_cover_image_upload_error", {});
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
      className={cn(
        "relative flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground",
        { "border-solid": resolvedPicture },
      )}
    >
      <input {...getInputProps()} />
      {resolvedPicture ? (
        <img
          src={resolvedPicture}
          alt="Profile cover"
          className={cn("absolute inset-0 size-full object-cover", {
            "opacity-25": loadingUploadImage,
          })}
        />
      ) : null}
      {loadingUploadImage ? <Spinner className="relative" /> : null}
      {!loadingUploadImage && resolvedPicture ? (
        <span className="absolute right-2 bottom-2 rounded-md bg-background/90 px-2 py-1 text-xs text-foreground">
          Replace cover
        </span>
      ) : null}
      {!loadingUploadImage && !resolvedPicture ? (
        <span className="flex items-center gap-2">
          <IconUpload size={16} />
          Click or drop an image
        </span>
      ) : null}
    </div>
  );
};
