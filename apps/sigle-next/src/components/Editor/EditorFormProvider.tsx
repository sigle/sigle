import type { paths } from '@/__generated__/sigle-api/openapi';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

const editorPostSchema = z.object({
  type: z.enum(['draft', 'published'] as const),
  title: z.string().min(4),
  content: z.string().min(4),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  coverImage: z.string().optional(),
  collect: z.object({
    collectPrice: z.object({
      type: z.enum(['free', 'paid'] as const),
      price: z.coerce.number().min(0),
    }),
    collectLimit: z
      .discriminatedUnion('enabled', [
        z.object({
          enabled: z.literal(true),
          limit: z.coerce.number().int().min(1),
        }),
        z.object({
          enabled: z.literal(false),
        }),
      ])
      .optional(),
  }),
});

export type EditorPostFormData = z.infer<typeof editorPostSchema>;

interface EditorFormProviderProps {
  children: React.ReactNode;
  type: 'draft' | 'published';
  post: paths['/api/protected/drafts/{draftId}']['get']['responses'][200]['content']['application/json'];
}

export const EditorFormProvider = ({
  children,
  type,
  post,
}: EditorFormProviderProps) => {
  const methods = useForm<EditorPostFormData>({
    mode: 'onBlur',
    resolver: zodResolver(editorPostSchema),
    defaultValues: {
      type,
      title: post.title,
      content: post.content || '',
      metaTitle: post.metaTitle || undefined,
      metaDescription: post.metaDescription || undefined,
      coverImage: post.coverImage || undefined,
      collect: {
        collectPrice: {
          type: 'free',
          price: 0,
        },
        collectLimit: {
          enabled: false,
        },
      },
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
