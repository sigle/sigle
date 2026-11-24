"use client";

import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { PageEditorSkeleton } from "./loading";

export default function PostCreate() {
  const router = useRouter();

  const { mutate: createPost } = sigleApiClient.useMutation(
    "post",
    "/api/drafts",
    {
      onSuccess: (data) => {
        router.push(Routes.editPost({ postId: data.id }));
      },
      onError: (error) => {
        toast.error("Failed to create post", {
          description: error.message,
        });
        posthog.captureException(error);
      },
    },
  );

  // React may run this effect twice for one mount, as Strict Mode does in
  // development, and each run would create a draft.
  const created = useRef(false);

  useEffect(() => {
    if (created.current) return;

    created.current = true;
    createPost({ body: {} });
  }, [createPost]);

  return <PageEditorSkeleton />;
}
