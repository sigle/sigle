"use client";

import { use } from "react";
import { EditorCoverImage } from "@/components/Editor/EditorCoverImage";
import { EditorFormProvider } from "@/components/Editor/EditorFormProvider";
import { EditorTipTap } from "@/components/Editor/EditorTiptap";
import { EditorTitle } from "@/components/Editor/EditorTitle";
import { EditorHeader } from "@/components/Editor/Header/EditorHeader";
import { PublishDialog } from "@/components/Editor/Publish/PublishDialog";
import { EditorSettings } from "@/components/Editor/Settings/EditorSettings";
import { useStoredDraft } from "@/hooks/useStoredDraft";
import { sigleApiClient } from "@/lib/sigle";
import { PageEditorSkeleton } from "../../new/loading";

interface PostEditPageProps {
  params: Promise<{ postId: string }>;
}

export default function PostEditPage(props: PostEditPageProps) {
  const params = use(props.params);

  const post = useStoredDraft(params.postId);
  const { data: me } = sigleApiClient.useSuspenseQuery("get", "/api/me");

  if (!post) {
    return <PageEditorSkeleton />;
  }

  // Image uploads are only on the Pro plan, free users embed images by URL.
  const canUploadImages = me.plan === "pro";

  return (
    <EditorFormProvider post={post}>
      <EditorHeader />
      <div className="mx-auto max-w-2xl">
        <EditorTitle />
        <EditorCoverImage canUploadImages={canUploadImages} />
        <EditorTipTap canUploadImages={canUploadImages} />
      </div>
      <EditorSettings />
      <PublishDialog
        postId={params.postId}
        publishStatus={post.publishStatus}
      />
    </EditorFormProvider>
  );
}
