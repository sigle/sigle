"use client";

import { use } from "react";
import { EditorCoverImage } from "@/components/Editor/EditorCoverImage";
import { EditorFormProvider } from "@/components/Editor/EditorFormProvider";
import { EditorTipTap } from "@/components/Editor/EditorTiptap";
import { EditorTitle } from "@/components/Editor/EditorTitle";
import { EditorHeader } from "@/components/Editor/Header/EditorHeader";
import { PublishDialog } from "@/components/Editor/Publish/PublishDialog";
import { EditorSettings } from "@/components/Editor/Settings/EditorSettings";
import { sigleApiClient } from "@/lib/sigle";

interface PostEditPageProps {
  params: Promise<{ postId: string }>;
}

export default function PostEditPage(props: PostEditPageProps) {
  const params = use(props.params);

  const { data: post } = sigleApiClient.useSuspenseQuery(
    "get",
    "/api/protected/drafts/{draftId}",
    {
      params: {
        path: {
          draftId: params.postId,
        },
      },
    },
  );

  return (
    <EditorFormProvider post={post}>
      <EditorHeader />
      <div className="mx-auto max-w-2xl">
        <EditorTitle />
        <EditorCoverImage />
        <EditorTipTap />
      </div>
      <EditorSettings />
      <PublishDialog postId={params.postId} />
    </EditorFormProvider>
  );
}
