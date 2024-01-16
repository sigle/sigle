import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Story } from '@/types';

const editorPostSchema = z.object({
  title: z.string().min(4).max(200),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  createdAt: z.string(),
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
      coverImage: story.coverImage,
      metaTitle: story.metaTitle,
      metaDescription: story.metaDescription,
      metaImage: story.metaImage,
      canonicalUrl: story.canonicalUrl,
      // Convert to string to avoid datepicker issues with the native date input
      createdAt: format(story.createdAt, 'yyyy-MM-dd'),
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
