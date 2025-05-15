"use client";

import { NextLink } from "@/components/Shared/NextLink";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { getExplorerTransactionUrl } from "@/lib/stacks";
import {
  Badge,
  Button,
  Card,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
} from "@radix-ui/themes";
import type { paths } from "@sigle/sdk";
import { IconDotsVertical } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

export default function DashboardDrafts() {
  const {
    data: drafts,
    isLoading: loadingDrafts,
    error: errorDrafts,
    refetch: refetchDrafts,
  } = sigleApiClient.useQuery("get", "/api/protected/drafts/list", {
    params: {
      query: {
        limit: 50,
      },
    },
  });

  return (
    <div className="py-10">
      <Heading>Drafts</Heading>
      <Card mt="5" size="2">
        {loadingDrafts ? (
          <Flex justify="center" py="7">
            <Spinner />
          </Flex>
        ) : null}

        {errorDrafts ? (
          <Flex justify="center" py="7">
            <Text size="2" color="red">
              An error occurred, please try again later
            </Text>
          </Flex>
        ) : null}

        {drafts?.length === 0 ? (
          <Flex
            justify="center"
            align="center"
            py="7"
            gap="4"
            direction="column"
          >
            <Text size="2" color="gray">
              No drafts yet
            </Text>
            <Button color="gray" highContrast asChild>
              <NextLink href={"/p/new"}>Write a post</NextLink>
            </Button>
          </Flex>
        ) : null}

        {drafts?.map((draft) => (
          <Draft key={draft.id} draft={draft} refetchDrafts={refetchDrafts} />
        ))}
      </Card>
    </div>
  );
}

const Draft = ({
  draft,
  refetchDrafts,
}: {
  draft: paths["/api/protected/drafts/list"]["get"]["responses"][200]["content"]["application/json"][0];
  refetchDrafts: () => Promise<unknown>;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutateAsync: deletePost } = sigleApiClient.useMutation(
    "post",
    "/api/protected/drafts/{draftId}/delete",
    {
      onError: (error: { message: string }) => {
        toast.error("Failed to upload metadata", {
          description: error.message,
        });
      },
    },
  );

  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this draft?");
    if (!ok) return;

    setIsDeleting(true);
    await deletePost({
      params: {
        path: {
          draftId: draft.id,
        },
      },
    });
    await refetchDrafts();
    toast.message("Draft deleted");
  };

  const isTxPending = draft.txStatus === "pending";

  const heading =
    draft.metaTitle || draft.title ? (
      <Heading as="h3" size="4" className="line-clamp-2">
        {" "}
        {draft.metaTitle || draft.title}{" "}
      </Heading>
    ) : (
      <Heading as="h3" size="4" className="line-clamp-2" color="gray">
        No title
      </Heading>
    );

  return (
    <div className="border-b border-solid border-gray-6 py-5 first:pt-0 last:border-b-0 last:pb-0">
      {draft.txStatus === "pending" && draft.txId && (
        <Badge className="mb-2" asChild>
          <a
            href={getExplorerTransactionUrl(draft.txId)}
            target="_blank"
            rel="noreferrer"
          >
            Publishing: Transaction pending
          </a>
        </Badge>
      )}
      {draft.txStatus === "pending" ? (
        heading
      ) : (
        <NextLink href={Routes.editPost({ postId: draft.id })}>
          {heading}
        </NextLink>
      )}
      <Flex justify="between" align="center">
        <Text as="p" mt="3" color="gray" size="1">
          Created {format(new Date(draft.createdAt), "MMM dd, yyyy")} • Last
          updated {format(new Date(draft.updatedAt), "MMM dd, yyyy h:mm a")}
        </Text>
        {isDeleting ? <Spinner /> : null}
        {!isDeleting && !isTxPending ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="ghost" color="gray" size="2">
                <IconDotsVertical size={16} />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              align="end"
              variant="soft"
              color="gray"
              highContrast
            >
              <DropdownMenu.Item asChild>
                <NextLink href={Routes.editPost({ postId: draft.id })}>
                  Edit
                </NextLink>
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={onDelete}>Delete</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : null}
      </Flex>
    </div>
  );
};
