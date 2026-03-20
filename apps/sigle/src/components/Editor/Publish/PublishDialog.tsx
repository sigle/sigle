"use client";

import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { MultiStep } from "@/components/Shared/MultiStep";
import { useMultiStep } from "@/components/Shared/MultiStepToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useContractCall } from "@/hooks/useContractCall";
import { useSession } from "@/lib/auth-hooks";
import { sigleApiClient, sigleClient } from "@/lib/sigle";
import { waitForTransaction } from "@/lib/stacks";
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
  const { contractCall } = useContractCall();
  const { mutateAsync: uploadMetadata } = sigleApiClient.useMutation(
    "post",
    "/api/protected/drafts/{draftId}/upload-metadata",
  );
  const { mutateAsync: updateTxId } = sigleApiClient.useMutation(
    "post",
    "/api/protected/drafts/{draftId}/set-tx-id",
  );

  const { steps, start, completeStep, setStepError } = useMultiStep({
    steps: [
      { id: "arweave", title: "Uploading data to Arweave" },
      { id: "transaction", title: "Waiting for blockchain confirmation" },
      { id: "indexing", title: "Indexing new post" },
    ],
  });

  const onSubmit = () => {
    handleSubmit(
      async (data) => {
        if (!session) return;
        setPublishingLoading(true);
        start();

        posthog.capture("post_publish_start", {
          postId,
        });

        const metadata = await generateSigleMetadataFromForm({
          userAddress: session.user.id,
          type: data.type,
          editor,
          postId,
          post: data,
        });

        if (metadata.content.content.includes("blob:")) {
          posthog.capture("post_publish_images_uploading_error", {
            postId,
          });
          toast.error("Images still uploading", {
            description:
              "Please wait for all images to finish uploading before publishing",
          });
          setPublishingLoading(false);
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

        completeStep("arweave");

        const arweaveUrl = `ar://${uploadedMetadata.id}`;
        const { parameters } = sigleClient.publishPost({
          metadataUri: arweaveUrl,
        });
        const contractCallResult = await contractCall(parameters);
        if (contractCallResult.isErr()) {
          posthog.capture("post_publish_cancel", {
            postId,
            error: contractCallResult.error,
          });
          setStepError("transaction", contractCallResult.error.message);
          return;
        }

        const txId = contractCallResult.value;
        posthog.capture("post_publish_transaction_submitted", {
          postId,
          txId,
        });

        const transactionResult = await waitForTransaction({ txId });
        if (transactionResult.isErr()) {
          posthog.capture("post_publish_wait_transaction_error", {
            postId,
            error: transactionResult.error,
          });
          setStepError("transaction", transactionResult.error.message);
          return;
        }
        if (transactionResult.value.tx_status !== "success") {
          posthog.capture("post_publish_transaction_failed", {
            postId,
            tx_status: transactionResult.value.tx_status,
          });
          setStepError("transaction", "Transaction failed");
          return;
        }
        completeStep("transaction");

        await updateTxId({
          params: {
            path: {
              draftId: postId,
            },
          },
          body: {
            txId,
          },
        });

        completeStep("indexing");
      },
      (errors) => {
        console.error("Publishing form errors", { errors });
        toast.error("Error publishing", {
          description: "Please check the form for errors",
        });
      },
    )();
  };

  const onOpenChange = (open: boolean) => {
    if (!publishingLoading) {
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
        {!publishingLoading ? (
          <PublishReview onPublish={onSubmit} />
        ) : (
          <div className="flex flex-col gap-3 py-4">
            <MultiStep steps={steps} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
