"use client";

import { sigleApiClient, sigleApiFetchclient } from "@/__generated__/sigle-api";
import { useContractCall } from "@/hooks/useContractCall";
import { useContractDeploy } from "@/hooks/useContractDeploy";
import { Routes } from "@/lib/routes";
import { sigleClient } from "@/lib/sigle";
import {
  getExplorerTransactionUrl,
  getPromiseTransactionConfirmation,
} from "@/lib/stacks";
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
import { useSession } from "next-auth/react";
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
  const { contractDeploy } = useContractDeploy({
    onCancel: () => {
      posthog.capture("post_publish_cancel", {
        postId,
      });

      setPublishingLoading(false);
    },
    onSuccess: async (tx) => {
      // For some reason, from time to time the txId is returned without the 0x prefix
      const txId = !tx.txId.startsWith("0x") ? `0x${tx.txId}` : tx.txId;

      posthog.capture("post_publish_transaction_submitted", {
        postId,
        txId,
      });

      setPublishingLoading({
        action: "transaction-pending",
        txId,
      });

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

      // Redirect to the deploy page
      router.push(`/p/${postId}/deploy`);
    },
  });

  const { contractCall } = useContractCall({
    onSuccess: (data) => {
      toast.promise(getPromiseTransactionConfirmation(data.txId), {
        loading: "Edit transaction submitted, it will be indexed shortly",
        success: "Post updated successfully",
        error: "Transaction failed",
        action: {
          label: "View tx",
          onClick: () =>
            window.open(getExplorerTransactionUrl(data.txId), "_blank"),
        },
      });

      router.push(Routes.post({ postId }));
    },
    onError: (error) => {
      toast.error("Failed to edit", {
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
              contractName: newPostId,
              codeBody: contract,
            });
            return;
          }

          const publishedPost = await sigleApiFetchclient.GET(
            "/api/posts/{postId}",
            {
              params: {
                path: {
                  postId,
                },
              },
            },
          );
          if (!publishedPost.data) {
            setPublishingError("Error fetching published post");
            Sentry.captureException("Error fetching published post");
            return;
          }

          const { parameters } = sigleClient.setBaseTokenUri({
            contract: publishedPost.data.address,
            metadata: arweaveUrl,
          });
          await contractCall(parameters);
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
