"use client";

import { sigleApiClient } from "@/__generated__/sigle-api";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { PageEditorSkeleton } from "./loading";

export default function PostCreate() {
  const router = useRouter();
  const { mutate: createPost } = sigleApiClient.useMutation(
    "post",
    "/api/protected/drafts/create",
    {
      onSuccess: (data) => {
        router.push(`/p/${data.id}/edit`);
      },
      onError: (error) => {
        toast.error("Failed to create post", {
          description: error.message,
        });
        Sentry.captureException(error);
      },
    },
  );

  useEffect(() => {
    createPost({});
  }, [createPost]);

  return <PageEditorSkeleton />;
}
