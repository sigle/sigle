import type { paths } from "@sigle/sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const editorPostSchema = z.object({
  type: z.enum(["draft", "published"] as const),
  title: z.string().min(4),
  content: z.string().min(4),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  canonicalUri: z.string().optional(),
});

export type EditorPostFormData = z.infer<typeof editorPostSchema>;

interface EditorFormProviderProps {
  children: React.ReactNode;
  post: paths["/api/protected/drafts/{draftId}"]["get"]["responses"][200]["content"]["application/json"];
}

export const EditorFormProvider = ({
  children,
  post,
}: EditorFormProviderProps) => {
  const methods = useForm({
    mode: "onBlur",
    resolver: zodResolver(editorPostSchema),
    defaultValues: {
      type: post.type,
      title: post.title,
      content: post.content || "",
      metaTitle: post.metaTitle || undefined,
      metaDescription: post.metaDescription || undefined,
      coverImage: post.coverImage || undefined,
      tags: post.tags || [],
      canonicalUri: post.canonicalUri || undefined,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
