"use client";

import { sigleApiClient } from "@/__generated__/sigle-api";
import { EditorCoverImage } from "@/components/Editor/EditorCoverImage";
import { EditorFormProvider } from "@/components/Editor/EditorFormProvider";
import { EditorTipTap } from "@/components/Editor/EditorTiptap";
import { EditorTitle } from "@/components/Editor/EditorTitle";
import { EditorHeader } from "@/components/Editor/Header/EditorHeader";
import { PublishDialog } from "@/components/Editor/Publish/PublishDialog";
import { EditorSettings } from "@/components/Editor/Settings/EditorSettings";
import { Container } from "@radix-ui/themes";
import { use } from "react";

type PostEditPageProps = {
  params: Promise<{ postId: string }>;
};

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
      <Container size="2">
        <EditorTitle />
        <EditorCoverImage />
        <EditorTipTap />
      </Container>
      <EditorSettings />
      <PublishDialog postId={params.postId} />
    </EditorFormProvider>
  );
}
