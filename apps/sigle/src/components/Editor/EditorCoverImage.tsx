"use client";

import { IconCameraPlus, IconHandGrab, IconTrash } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import {
  type MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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

  const { mutateAsync: uploadImage, isPending: loadingUploadImage } =
    sigleApiClient.useMutation("post", "/api/drafts/{draftId}/images");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) return;

      if (loadingUploadImage) return;

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

    autoUploadImage();
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
          size="lg"
          variant="secondary"
          onClick={() => setIsUpgradeOpen(true)}
        >
          Add cover image <IconCameraPlus size={16} />
          <ProBadge />
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

  return (
    <div
      {...getRootProps()}
      className={cn("mt-4 flex justify-center", {
        "justify-start": !preview && !resolvedWatchCoverImage,
      })}
      onClick={(e) => e.stopPropagation()}
    >
      <input {...getInputProps()} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{ delay: 0.1 }}
        key={!preview && !resolvedWatchCoverImage ? "button" : "image"}
      >
        {!preview && !resolvedWatchCoverImage ? (
          !isDragActive ? (
            <Button size="lg" variant="secondary" onClick={open}>
              Add cover image <IconCameraPlus size={16} />
            </Button>
          ) : (
            <Button size="lg" variant="outline">
              Drop your cover image here <IconHandGrab size={16} />
            </Button>
          )
        ) : (
          <div className="relative mx-auto">
            {/* oxlint-disable-next-line no-img-element */}
            <img
              src={preview || resolvedWatchCoverImage || ""}
              className={cn("rounded-md", {
                "opacity-25": loadingUploadImage,
              })}
              alt="Cover post"
            />
            {!loadingUploadImage ? (
              <div className="absolute top-2 right-2">
                <Button size="icon-lg" variant="secondary" onClick={onRemove}>
                  <IconTrash size={16} />
                </Button>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner />
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
