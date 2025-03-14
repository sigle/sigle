"use client";

import { sigleApiClient } from "@/__generated__/sigle-api";
import { useContractDeploy } from "@/hooks/useContractDeploy";
import { sigleClient } from "@/lib/sigle";
import {
  Callout,
  Dialog,
  Flex,
  Spinner,
  Text,
  VisuallyHidden,
} from "@radix-ui/themes";
import * as Sentry from "@sentry/nextjs";
import { parseBTC } from "@sigle/sdk";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";
import { generateSigleMetadataFromForm } from "../utils";
import { PublishReview } from "./PublishReview";

interface PublishDialogProps {
  postId: string;
}

export const PublishDialog = ({ postId }: PublishDialogProps) => {
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
  const { contractDeploy } = useContractDeploy({
    onCancel: () => {
      posthog.capture("post_publish_cancel", {
        postId,
      });

      setPublishingLoading(false);
    },
    onSuccess: async (tx) => {
      posthog.capture("post_publish_transaction_submitted", {
        postId,
        txId: tx.txId,
      });

      setPublishingLoading({
        action: "transaction-pending",
        txId: tx.txId,
      });

      await updateTxId({
        params: {
          path: {
            draftId: postId,
          },
        },
        body: {
          txId: tx.txId,
        },
      });

      // Redirect to the deploy page
      router.push(`/p/${postId}/deploy`);
    },
  });

  const onSubmit = () => {
    handleSubmit(
      async (data) => {
        try {
          setPublishingError(null);

          posthog.capture("post_publish_start", {
            postId,
          });

          // TODO verify that images do not start with blob: otherwise it means it's still loading (in content)
          // We should stop and notify the user that the image is still loading

          // Do we do one global id or other?
          // TODO create a REST route to determine the next post id? But do not use postId
          const newPostId = postId;
          const metadata = await generateSigleMetadataFromForm({
            editor,
            postId: newPostId,
            post: data,
          });

          const uploadedMetadata = await uploadMetadata({
            params: {
              path: {
                draftId: postId,
              },
            },
            body: {
              metadata: metadata as any,
            },
          });
          const arweaveUrl = `ar://${uploadedMetadata.id}`;

          if (type === "draft") {
            const { contract } = sigleClient.generatePostContract({
              metadata: arweaveUrl,
              collectInfo: {
                amount:
                  data.collect.collectPrice.type === "paid"
                    ? parseBTC(data.collect.collectPrice.price.toString())
                    : 0,
                maxSupply:
                  data.collect.collectLimit.type === "fixed" &&
                  data.collect.collectLimit.limit
                    ? data.collect.collectLimit.limit
                    : undefined,
              },
            });

            await contractDeploy({
              // TODO decide on the contract name slug, id or other
              contractName: newPostId,
              codeBody: contract,
            });
            return;
          }

          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
    <Dialog.Root open={publishOpen} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <Dialog.Title>Publish</Dialog.Title>
        <Dialog.Description>Publish your post</Dialog.Description>
      </VisuallyHidden>
      <Dialog.Content size="3" className="max-w-screen-sm">
        {publishingLoading === false ? (
          <PublishReview onPublish={onSubmit} />
        ) : (
          <Flex
            justify="center"
            align="center"
            py="7"
            direction="column"
            className="space-y-2"
          >
            <div className="mb-2">
              <Spinner />
            </div>
            <Text as="div" size="2">
              Your post is being published...
            </Text>
          </Flex>
        )}
        {publishingError ? (
          <Callout.Root color="red" role="alert" className="mt-4">
            <Callout.Icon>
              <IconExclamationCircle />
            </Callout.Icon>
            <Callout.Text>Error publishing: {publishingError}</Callout.Text>
          </Callout.Root>
        ) : null}
      </Dialog.Content>
    </Dialog.Root>
  );
};
