import type { paths } from "@sigle/sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useMultiStepToastStore } from "@/components/Shared/MultiStepToast";
import { useEditorStore } from "./store";

const editorPostSchema = z.object({
  type: z.enum(["draft", "published"] as const),
  title: z.string().min(4),
  content: z.string().min(4),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  canonicalUri: z.string().optional(),
  contentWarning: z.enum(["nsfw", "sensitive", "spoiler"]).optional(),
});

export type EditorPostFormData = z.infer<typeof editorPostSchema>;

interface EditorFormProviderProps {
  children: React.ReactNode;
  post: paths["/api/drafts/{draftId}"]["get"]["responses"][200]["content"]["application/json"];
}

export const EditorFormProvider = ({
  children,
  post,
}: EditorFormProviderProps) => {
  const methods = useForm({
    mode: "onBlur",
    resolver: zodResolver(editorPostSchema),
    defaultValues: {
      type: "draft",
      title: post.title,
      content: post.content || "",
      metaTitle: post.metaTitle || undefined,
      metaDescription: post.metaDescription || undefined,
      coverImage: post.coverImage || undefined,
      tags: post.tags || [],
      canonicalUri: post.canonicalUri || undefined,
      contentWarning: post.contentWarning ?? undefined,
    },
  });

  // The editor stores are global and outlive this draft: without a reset the
  // next draft opens with this one's dialogs and publish steps.
  useEffect(
    () => () => {
      useEditorStore.getState().reset();
      useMultiStepToastStore.getState().reset();
    },
    [post.id],
  );

  return <FormProvider {...methods}>{children}</FormProvider>;
};
