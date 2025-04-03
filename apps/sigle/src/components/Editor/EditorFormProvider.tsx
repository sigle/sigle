import type { paths } from "@/__generated__/sigle-api/openapi";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatBTC } from "@sigle/sdk";
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
  collect: z.object({
    collectPrice: z.object({
      type: z.enum(["free", "paid"] as const),
      price: z.coerce.number().min(0),
    }),
    collectLimit: z.object({
      type: z.enum(["open", "fixed"] as const),
      limit: z.coerce.number().int().min(1),
    }),
  }),
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
      collect: {
        collectPrice: {
          type: post.collectPriceType || "free",
          price: post.collectPrice
            ? (formatBTC(BigInt(post.collectPrice)) as unknown as number)
            : 0,
        },
        collectLimit: {
          type: post.collectLimitType || "open",
          limit: post.collectLimit || 100,
        },
      },
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
