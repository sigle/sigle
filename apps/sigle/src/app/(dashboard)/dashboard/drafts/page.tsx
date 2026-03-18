"use client";

import type { paths } from "@sigle/sdk";
import { Button, Heading, IconButton } from "@radix-ui/themes";
import { IconDotsVertical } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { NextLink } from "@/components/Shared/NextLink";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { getExplorerTransactionUrl } from "@/lib/stacks";

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
      <Card className="mt-5">
        <CardContent>
          {loadingDrafts ? (
            <div className="flex justify-center py-7">
              <Spinner />
            </div>
          ) : null}

          {errorDrafts ? (
            <div className="flex justify-center py-7">
              <p className="text-sm text-destructive">
                An error occurred, please try again later. {errorDrafts.message}
              </p>
            </div>
          ) : null}

          {drafts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-7">
              <p className="text-sm text-muted-foreground">No drafts yet</p>
              <Button color="gray" highContrast asChild>
                <NextLink href="/p/new">Write a post</NextLink>
              </Button>
            </div>
          ) : null}

          {drafts?.map((draft) => (
            <Draft key={draft.id} draft={draft} refetchDrafts={refetchDrafts} />
          ))}
        </CardContent>
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
        <Badge
          className="mb-2"
          render={
            <a
              href={getExplorerTransactionUrl(draft.txId)}
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          Publishing: Transaction pending
        </Badge>
      )}
      {draft.txStatus === "pending" ? (
        heading
      ) : (
        <NextLink href={Routes.editPost({ postId: draft.id })}>
          {heading}
        </NextLink>
      )}
      <div className="flex items-center justify-between">
        <p className="mt-3 text-xs text-muted-foreground">
          Created {format(new Date(draft.createdAt), "MMM dd, yyyy")} • Last
          updated {format(new Date(draft.updatedAt), "MMM dd, yyyy h:mm a")}
        </p>
        {isDeleting ? <Spinner /> : null}
        {!isDeleting && !isTxPending ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <IconButton variant="ghost" color="gray" size="2">
                  <IconDotsVertical size={16} />
                </IconButton>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={
                  <NextLink href={Routes.editPost({ postId: draft.id })}>
                    Edit
                  </NextLink>
                }
              />
              <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
};
