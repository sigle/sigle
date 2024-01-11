import { Story } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

const editorPostSchema = z.object({
  title: z.string().min(4).max(200),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
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
  // TODO init with story data
  const methods = useForm<EditorPostFormData>({
    resolver: zodResolver(editorPostSchema),
    defaultValues: {
      title: story.title,
      metaTitle: story.metaTitle,
      metaDescription: story.metaDescription,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
