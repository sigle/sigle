"use client";

import * as Sentry from "@sentry/nextjs";
import { IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useContractCall } from "@/hooks/useContractCall";
import { useSession } from "@/lib/auth-hooks";
import { sigleApiClient, sigleClient } from "@/lib/sigle";
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
  const [publishingError, setPublishingError] = useState<string | null>(null);
  const { handleSubmit, watch } = useFormContext<EditorPostFormData>();
  const type = watch("type");
  const editor = useEditorStore((state) => state.editor);
  const publishOpen = useEditorStore((state) => state.publishOpen);
  const setPublishOpen = useEditorStore((state) => state.setPublishOpen);
  const [publishingLoading, setPublishingLoading] = useState<
    { action: "transaction-pending"; txId: string } | false
  >(false);
  const { mutateAsync: uploadMetadata } = sigleApiClient.useMutation(
    "post",
    "/api/protected/drafts/{draftId}/upload-metadata",
  );
  const { mutateAsync: updateTxId } = sigleApiClient.useMutation(
    "post",
    "/api/protected/drafts/{draftId}/set-tx-id",
  );

  const { contractCall } = useContractCall({
    onSuccess: async (data) => {
      posthog.capture("post_publish_transaction_submitted", {
        postId,
        txId: data.txId,
      });

      setPublishingLoading({
        action: "transaction-pending",
        txId: data.txId,
      });

      await updateTxId({
        params: {
          path: {
            draftId: postId,
          },
        },
        body: {
          txId: data.txId,
        },
      });

      // Redirect to the deploy page
      router.push(`/p/${postId}/deploy`);
    },
    onError: (error) => {
      posthog.capture("post_publish_cancel", {
        postId,
      });

      setPublishingLoading(false);

      toast.error("Failed to publish", {
        description: error,
      });
    },
  });

  const onSubmit = () => {
    handleSubmit(
      async (data) => {
        try {
          setPublishingError(null);
          if (!session) return;

          posthog.capture("post_publish_start", {
            postId,
          });

          // Do we do one global id or other?
          // TODO create a REST route to determine the next post id? But do not use postId
          const newPostId = postId;
          const metadata = await generateSigleMetadataFromForm({
            userAddress: session.user.id,
            type: data.type,
            editor,
            postId: newPostId,
            post: data,
          });

          // Check for blob URLs in editor content which indicates unfinished image uploads
          // or something that went wrong during the upload process
          if (metadata.content.content.includes("blob:")) {
            setPublishingError(
              "Please wait for all images to finish uploading before publishing",
            );
            toast.error("Images still uploading", {
              description:
                "Please wait for all images to finish uploading before publishing",
            });
            return;
          }

          const uploadedMetadata = await uploadMetadata({
            params: {
              path: {
                draftId: postId,
              },
            },
            body: {
              type,
              // oxlint-disable-next-line no-explicit-any
              metadata: metadata as any,
            },
          });
          const arweaveUrl = `ar://${uploadedMetadata.id}`;

          const { parameters } = sigleClient.publishPost({
            metadataUri: arweaveUrl,
          });
          await contractCall(parameters);
          // oxlint-disable-next-line no-explicit-any
        } catch (error: any) {
          console.error("Error SDK publishing", error);
          toast("Error publishing", {
            description: error.message ? error.message : error,
          });
          setPublishingError(error.message ? error.message : error);
          Sentry.captureException(error);
          return;
        }
      },
      (errors) => {
        console.error("Publishing form errors", { errors });
        toast("Error publishing", {
          description: "Please check the form for errors",
        });
      },
    )();
  };

  const onOpenChange = (open: boolean) => {
    if (publishingLoading === false) {
      setPublishOpen(open);
    }
  };

  return (
    <Dialog open={publishOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish</DialogTitle>
          <DialogDescription>Publish your post</DialogDescription>
        </DialogHeader>
        {publishingLoading === false ? (
          <PublishReview onPublish={onSubmit} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-7">
            <div className="mb-2">
              <Spinner />
            </div>
            <div>Your post is being published...</div>
          </div>
        )}
        {publishingError ? (
          <Alert variant="destructive">
            <IconAlertCircle size={16} />
            <AlertTitle>Publishing failed</AlertTitle>
            <AlertDescription>
              Error publishing: {publishingError}
            </AlertDescription>
          </Alert>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
