"use client";

import type { paths } from "@sigle/sdk";
import { request } from "@stacks/connect";
import { IconArrowLeft, IconRefresh } from "@tabler/icons-react";
import { Result } from "better-result";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect, useRef, useState } from "react";
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
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { getErrorMessage } from "@/lib/utils";
import type { EditorPostFormData } from "../EditorFormProvider";
import { hasPendingImageUploads } from "../extensions/Image";
import { useEditorStore } from "../store";
import { generateSigleMetadataFromForm } from "../utils";
import { PublishReview } from "./PublishReview";
import { waitForPublishCompletion } from "./wait-for-publish-completion";

interface PublishDialogProps {
  postId: string;
  /** The draft's publish status when the editor loaded it. */
  publishStatus?: paths["/api/drafts/{draftId}"]["get"]["responses"][200]["content"]["application/json"]["publishStatus"];
}

export const PublishDialog = ({
  postId,
  publishStatus,
}: PublishDialogProps) => {
  const posthog = usePostHog();
  const router = useRouter();
  const { handleSubmit, watch } = useFormContext<EditorPostFormData>();
  const type = watch("type");
  const editor = useEditorStore((state) => state.editor);
  const publishOpen = useEditorStore((state) => state.publishOpen);
  const setPublishOpen = useEditorStore((state) => state.setPublishOpen);
  // A draft reopened while its publish runs on the server: show its progress
  // instead of an editor whose saves are refused until it finishes.
  const isPublishInProgress =
    publishStatus === "pending" || publishStatus === "processing";
  const [publishingLoading, setPublishingLoading] =
    useState(isPublishInProgress);

  const { mutateAsync: publishDraft } = sigleApiClient.useMutation(
    "post",
    "/api/drafts/{draftId}/publish",
  );

  const { steps, start, completeStep, setStepLoading, setStepError, reset } =
    useMultiStep({
      steps: [
        { id: "preparing", title: "Preparing metadata & cover image" },
        { id: "signature", title: "Signing with Stacks wallet" },
        { id: "arweave", title: "Uploading data to Arweave" },
      ] as const,
    });

  // Set once the server accepted the signed metadata (202): from then on the
  // publish runs on the server, and the dialog only follows its status.
  const acceptedRef = useRef(false);
  const pollingRef = useRef<AbortController | null>(null);
  const resumedRef = useRef(false);

  useEffect(
    () => () => {
      pollingRef.current?.abort();
      // A remount (React strict mode) must resume the publish again.
      resumedRef.current = false;
    },
    [],
  );

  const hasError = steps.some((step) => step.status === "error");

  const isSignaturePending =
    steps.find((s) => s.id === "signature")?.status === "pending";

  const followPublish = async () => {
    pollingRef.current?.abort();
    const controller = new AbortController();
    pollingRef.current = controller;

    const completion = await waitForPublishCompletion(postId, {
      signal: controller.signal,
    });

    // Cancelled because the dialog is gone or a newer poll took over.
    if (
      controller.signal.aborted ||
      (completion.isErr() && "cancelled" in completion.error)
    ) {
      return;
    }

    if (completion.isErr()) {
      posthog.capture("post_publish_error", {
        postId,
        error: completion.error,
      });
      setStepError("arweave", completion.error.message);

      return;
    }

    completeStep("arweave");

    const { postId: targetPostId, arweaveTxId } = completion.value;
    posthog.capture("post_publish_success", {
      postId: targetPostId,
      arweaveId: arweaveTxId,
    });

    // wait 1s for a better UX
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    if (controller.signal.aborted) {
      return;
    }

    setPublishOpen(false);
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
  };

  const onSubmit = () => {
    void handleSubmit(
      async (data) => {
        acceptedRef.current = false;

        // Wait for uploads instead of publishing without them: an image still
        // uploading is left out of the content, and a new cover isn't set yet.
        if (
          (editor && hasPendingImageUploads(editor.state.doc)) ||
          useEditorStore.getState().isCoverUploading
        ) {
          posthog.capture("post_publish_images_uploading_error", { postId });
          toast.error("Images still uploading", {
            description:
              "Please wait for all images to finish uploading before publishing",
          });

          return;
        }

        setPublishingLoading(true);
        start();

        posthog.capture("post_publish_start", {
          postId,
        });

        let metadata;

        try {
          metadata = await generateSigleMetadataFromForm({
            editor,
            postId,
            post: data,
          });
        } catch (error) {
          posthog.captureException(error, { postId });

          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to prepare post metadata";

          // An `Error` serializes to `{}`, so PostHog gets its message.
          posthog.capture("post_publish_metadata_preparation_error", {
            postId,
            error: errorMessage,
          });

          setStepError("preparing", errorMessage);

          return;
        }

        completeStep("preparing");

        let signature: string;

        try {
          const { signature: _, ...metadataToSign } = metadata;
          const message = JSON.stringify(metadataToSign);

          const response = await request("stx_signMessage", {
            message,
          });

          signature = response.signature;
        } catch (error) {
          posthog.capture("post_publish_sign_message_error", {
            postId,
            error: error instanceof Error ? error.message : String(error),
          });
          setStepError(
            "signature",
            "Wallet signature request was cancelled or failed.",
          );

          return;
        }

        completeStep("signature");

        const publishResult = await publishDraft({
          params: {
            path: {
              draftId: postId,
            },
          },
          body: {
            // The API only accepts signed metadata.
            metadata: { ...metadata, signature },
          },
        })
          .then((result) => Result.ok(result))
          .catch((error: unknown) => Result.err(getErrorMessage(error)));

        if (publishResult.isErr()) {
          posthog.capture("post_publish_start_error", {
            postId,
            error: publishResult.error,
          });
          setStepError(
            "arweave",
            publishResult.error || "Failed to start publishing",
          );

          return;
        }

        acceptedRef.current = true;
        await followPublish();
      },
      (errors) => {
        toast.error("Error publishing", {
          description: "Please check the form for errors",
        });
      },
    )();
  };

  const onRetry = () => {
    if (acceptedRef.current) {
      setStepLoading("arweave");
      void followPublish();
      return;
    }

    onSubmit();
  };

  // Follow a publish already running on the server, see `isPublishInProgress`.
  useEffect(() => {
    if (resumedRef.current || !isPublishInProgress) {
      return;
    }

    resumedRef.current = true;
    acceptedRef.current = true;
    setPublishOpen(true);
    start();
    completeStep("preparing");
    completeStep("signature");
    void followPublish();
    // oxlint-disable-next-line exhaustive-deps
  }, [isPublishInProgress]);

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
          <DialogTitle className="headline text-2xl/tight">
            {publishingLoading
              ? type === "draft"
                ? "Publishing your story"
                : "Updating your story"
              : type === "draft"
                ? "Ready to publish?"
                : "Publish an update?"}
          </DialogTitle>
          <DialogDescription>
            {publishingLoading
              ? hasError
                ? "Something went wrong. You can retry or go back to the review."
                : "Keep this window open until it's done."
              : "Your wallet signs the story, then it's archived on Arweave and timestamped on Bitcoin."}
          </DialogDescription>
        </DialogHeader>

        {!publishingLoading ? (
          <PublishReview onPublish={onSubmit} />
        ) : (
          <div className="space-y-4 py-2">
            <MultiStep steps={steps} />

            {isSignaturePending && !hasError && (
              <div className="flex items-center gap-3 border-y border-border py-3 text-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground opacity-50" />
                  <span className="relative inline-flex size-2 rounded-full bg-foreground" />
                </span>
                <span>Approve the signature request in your wallet.</span>
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
                  <IconArrowLeft size={14} />
                  Back to review
                </Button>
                <Button type="button" size="sm" onClick={onRetry}>
                  <IconRefresh size={14} />
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
