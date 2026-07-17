"use client";

import { request } from "@stacks/connect";
import { Result } from "better-result";
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

  const { steps, start, completeStep, setStepError } = useMultiStep({
    steps: [
      { id: "arweave", title: "Uploading data to Arweave" },
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
          });
          toast.error("Failed to sign post");
          setPublishingLoading(false);
          return;
        }

        // Add the signature to the metadata
        metadata.signature = signature;

        const uploadedMetadataResult = await uploadMetadata({
          params: {
            path: {
              draftId: postId,
            },
          },
          body: {
            type,
            // oxlint-disable-next-line typescript/no-explicit-any
            metadata: metadata as any,
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
              : uploadedMetadataResult.error,
          );
          return;
        }

        completeStep("arweave");
        completeStep("indexing");

        // wait 1s for a better UX
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });

        const arweaveId = uploadedMetadataResult.value.id;
        router.push(
          Routes.post(
            { postId: arweaveId },
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
