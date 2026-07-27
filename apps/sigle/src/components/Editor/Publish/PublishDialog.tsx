"use client";

import { request } from "@stacks/connect";
import { IconArrowLeft, IconRefresh } from "@tabler/icons-react";
import { Result } from "better-result";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { MultiStep } from "@/components/Shared/MultiStep";
import { useMultiStep } from "@/components/Shared/MultiStepToast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-hooks";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";
import { generateSigleMetadataFromForm } from "../utils";
import { PublishReview } from "./PublishReview";

interface PublishDialogProps {
  postId: string;
}

export const PublishDialog = ({ postId }: PublishDialogProps) => {
  const { data: session } = useSession();
  const posthog = usePostHog();
  const router = useRouter();
  const { handleSubmit, watch } = useFormContext<EditorPostFormData>();
  const type = watch("type");
  const editor = useEditorStore((state) => state.editor);
  const publishOpen = useEditorStore((state) => state.publishOpen);
  const setPublishOpen = useEditorStore((state) => state.setPublishOpen);
  const [publishingLoading, setPublishingLoading] = useState(false);
  const { mutateAsync: uploadMetadata } = sigleApiClient.useMutation(
    "post",
    "/api/protected/drafts/{draftId}/upload-metadata",
  );

  const { steps, start, completeStep, setStepError, reset } = useMultiStep({
    steps: [
      { id: "preparing", title: "Preparing metadata & cover image" },
      { id: "signature", title: "Signing with Stacks wallet" },
      { id: "arweave", title: "Uploading data to Arweave" },
    ] as const,
  });

  const hasError = steps.some((step) => step.status === "error");
  const isSignaturePending =
    steps.find((s) => s.id === "signature")?.status === "pending";

  const onSubmit = () => {
    handleSubmit(
      async (data) => {
        if (!session) return;
        setPublishingLoading(true);
        start();

        posthog.capture("post_publish_start", {
          postId,
        });

        // oxlint-disable-next-line init-declarations
        let metadata;
        try {
          metadata = await generateSigleMetadataFromForm({
            userAddress: session.user.id,
            type: data.type,
            editor,
            postId,
            post: data,
          });
        } catch (error) {
          console.error(error);
          posthog.capture("post_publish_metadata_preparation_error", {
            postId,
            error,
          });
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to prepare post metadata";
          setStepError("preparing", errorMessage);
          return;
        }

        if (metadata.content.content.includes("blob:")) {
          posthog.capture("post_publish_images_uploading_error", {
            postId,
          });
          toast.error("Images still uploading", {
            description:
              "Please wait for all images to finish uploading before publishing",
          });
          setPublishingLoading(false);
          reset();
          return;
        }

        completeStep("preparing");

        let signature = "";
        try {
          const { signature: _, ...metadataToSign } = metadata;
          const message = JSON.stringify(metadataToSign);
          const response = await request("stx_signMessage", {
            message,
          });
          signature = response.signature;
        } catch (error) {
          console.error(error);
          posthog.capture("post_publish_sign_message_error", {
            postId,
            error,
          });
          setStepError(
            "signature",
            "Wallet signature request was cancelled or failed.",
          );
          return;
        }

        // Add the signature to the metadata
        metadata.signature = signature;
        completeStep("signature");

        const uploadedMetadataResult = await uploadMetadata({
          params: {
            path: {
              draftId: postId,
            },
          },
          body: {
            type,
            metadata: metadata as unknown as Record<string, never>,
          },
        })
          .then((result) => Result.ok(result))
          .catch((error) => Result.err(error));
        if (uploadedMetadataResult.isErr()) {
          posthog.capture("post_publish_upload_metadata_error", {
            postId,
            error: uploadedMetadataResult.error,
          });
          setStepError(
            "arweave",
            uploadedMetadataResult.error.message
              ? uploadedMetadataResult.error.message
              : "Failed to upload metadata to Arweave",
          );
          return;
        }

        completeStep("arweave");

        const { id: targetPostId, arweaveId } = uploadedMetadataResult.value;
        posthog.capture("post_publish_success", {
          postId: targetPostId,
          arweaveId,
        });

        // wait 1s for a better UX
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });

        router.push(
          Routes.post(
            { postId: targetPostId },
            {
              search: {
                published: true,
              },
            },
          ),
        );
      },
      (errors) => {
        console.error("Publishing form errors", { errors });
        toast.error("Error publishing", {
          description: "Please check the form for errors",
        });
      },
    )();
  };

  const handleBackToReview = () => {
    setPublishingLoading(false);
    reset();
  };

  const onOpenChange = (open: boolean) => {
    if (!publishingLoading) {
      setPublishOpen(open);
    }
  };

  return (
    <Dialog open={publishOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {publishingLoading
              ? type === "draft"
                ? "Publishing post"
                : "Updating post"
              : "Review & Publish"}
          </DialogTitle>
          <DialogDescription>
            {publishingLoading
              ? hasError
                ? "An error occurred during publishing. You can retry or return to review."
                : "Your post is being processed and published."
              : "Review your post details before publishing."}
          </DialogDescription>
        </DialogHeader>

        {!publishingLoading ? (
          <PublishReview onPublish={onSubmit} />
        ) : (
          <div className="space-y-4 py-2">
            <MultiStep steps={steps} />

            {isSignaturePending && !hasError && (
              <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs font-medium text-primary">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <span>
                  Action Required: Approve the signature request in your Stacks
                  wallet.
                </span>
              </div>
            )}

            {hasError && (
              <div className="mt-4 flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBackToReview}
                >
                  <IconArrowLeft size={14} className="mr-1.5" />
                  Back to review
                </Button>
                <Button type="button" size="sm" onClick={onSubmit}>
                  <IconRefresh size={14} className="mr-1.5" />
                  Retry
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
