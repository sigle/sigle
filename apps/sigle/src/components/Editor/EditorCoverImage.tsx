"use client";

import type { MouseEventHandler } from "react";
import { IconPhoto, IconTrash } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { ProBadge, UpgradeDialog } from "@/components/Shared/UpgradeDialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";
import { PUBLISH_LIMITS } from "@/lib/plans";
import { sigleApiClient } from "@/lib/sigle";
import type { EditorPostFormData } from "./EditorFormProvider";
import { useEditorStore } from "./store";

interface EditorCoverImageProps {
  /** Whether the user can upload images, which is only on the Pro plan. */
  canUploadImages?: boolean;
}

export const EditorCoverImage = ({
  canUploadImages = false,
}: EditorCoverImageProps) => {
  const postId = useParams<{ postId: string }>().postId;
  const posthog = usePostHog();
  const [preview, setPreview] = useState<string | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const { setValue, watch } = useFormContext<EditorPostFormData>();
  const watchCoverImage = watch("coverImage");

  const { mutate: uploadImage, isPending: loadingUploadImage } =
    sigleApiClient.useMutation("post", "/api/drafts/{draftId}/images");

  const setIsCoverUploading = useEditorStore(
    (state) => state.setIsCoverUploading,
  );

  useEffect(() => {
    setIsCoverUploading(loadingUploadImage);
  }, [loadingUploadImage, setIsCoverUploading]);

  const onDrop = useCallback(
    (acceptedFiles: Array<File>) => {
      const file = acceptedFiles[0];

      if (!file) {
        return;
      }

      if (loadingUploadImage) {
        return;
      }

      const previewBlobUrl = URL.createObjectURL(file);
      setPreview(previewBlobUrl);

      posthog.capture("cover_image_upload_start", {
        postId,
      });
      // SAFETY: the endpoint reads a raw binary body, but openapi-typescript
      // models `format: binary` request bodies as strings. The file is passed
      // through `bodySerializer` unchanged.
      uploadImage(
        {
          params: {
            path: {
              draftId: postId,
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
          onSuccess: (data) => {
            URL.revokeObjectURL(previewBlobUrl);
            setValue("coverImage", data.url);
            setPreview(null);
            posthog.capture("cover_image_upload_success", {
              postId,
            });
          },
          onError: (error) => {
            setPreview(null);
            posthog.capture("cover_image_upload_error", {
              postId,
            });
            toast.error(error?.message);
          },
        },
      );
    },
    [postId, loadingUploadImage, posthog, setValue, setPreview, uploadImage],
  );

  // The Gaia cover of a draft is uploaded once. `onDrop` changes with the
  // upload state, so without this a failed upload would start the next one.
  const gaiaUploadAttempt = useRef<string | null>(null);

  // This is required for the migration process from Gaia.
  // It can be removed once it's done.
  useEffect(() => {
    const autoUploadImage = async () => {
      const attempt = `${postId}:${watchCoverImage}`;

      if (
        canUploadImages &&
        watchCoverImage?.startsWith("https://gaia.blockstack.org/hub/") &&
        gaiaUploadAttempt.current !== attempt
      ) {
        gaiaUploadAttempt.current = attempt;
        const response = await fetch(watchCoverImage);
        const blob = await response.blob();
        const file = new File([blob], "cover-image", { type: blob.type });
        onDrop([file]);
      }
    };

    void autoUploadImage();
  }, [canUploadImages, postId, watchCoverImage, onDrop]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    disabled: !canUploadImages,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
  });

  const onRemove: MouseEventHandler<HTMLButtonElement> = (e) => {
    // Prevent the form from submitting
    e.preventDefault();
    e.stopPropagation();
    setValue("coverImage", undefined);
    posthog.capture("cover_image_removed", {
      postId,
    });
  };

  const resolvedWatchCoverImage = watchCoverImage
    ? resolveImageUrl(watchCoverImage, { gateway: true })
    : null;

  // Free users keep an existing cover, which they can remove, but cannot add
  // one: the button offers them Pro instead.
  if (!canUploadImages && !preview && !resolvedWatchCoverImage) {
    return (
      <div className="mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={() => setIsUpgradeOpen(true)}
        >
          <IconPhoto size={16} />
          Add cover image
          <ProBadge className="ml-0.5" />
        </Button>
        <UpgradeDialog
          open={isUpgradeOpen}
          onOpenChange={setIsUpgradeOpen}
          trigger="cover"
          title="Add a cover image with Pro"
          description={`Cover images are part of Pro, unlocked by holding an Explorer Guild NFT. Pro also lets you publish up to ${PUBLISH_LIMITS.pro} posts per day.`}
        />
      </div>
    );
  }

  const image = preview || resolvedWatchCoverImage;

  return (
    <div
      {...getRootProps()}
      className="mt-4"
      onClick={(e) => e.stopPropagation()}
    >
      <input {...getInputProps()} />
      {image ? (
        <div className="group relative overflow-hidden rounded-lg">
          {/* oxlint-disable-next-line nextjs/no-img-element -- shows the local preview while uploading */}
          <img
            src={image}
            className={cn("w-full transition-opacity", {
              "opacity-40": loadingUploadImage,
            })}
            alt="Cover post"
          />
          {loadingUploadImage ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <Button
              size="icon-sm"
              variant="secondary"
              aria-label="Remove cover image"
              title="Remove cover image"
              className="absolute top-3 right-3 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              onClick={onRemove}
            >
              <IconTrash size={16} />
            </Button>
          )}
        </div>
      ) : isDragActive ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-foreground/30 bg-muted/50 text-sm text-muted-foreground">
          Drop the image to use it as the cover
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={open}
        >
          <IconPhoto size={16} />
          Add cover image
        </Button>
      )}
    </div>
  );
};
