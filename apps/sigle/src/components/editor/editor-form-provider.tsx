import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Story } from '@/types';

const editorPostSchema = z.object({
  title: z.string().min(4).max(200),
  content: z.string().min(1),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
});

export type EditorPostFormData = z.infer<typeof editorPostSchema>;

interface EditorFormProviderProps {
  children: React.ReactNode;
  story: Story;
}

export const EditorFormProvider = ({
  children,
  story,
}: EditorFormProviderProps) => {
  const methods = useForm<EditorPostFormData>({
    resolver: zodResolver(editorPostSchema),
    defaultValues: {
      title: story.title,
      content: story.contentVersion === '2' ? story.content : '',
      metaTitle: story.metaTitle,
      metaDescription: story.metaDescription,
      canonicalUrl: story.canonicalUrl,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
