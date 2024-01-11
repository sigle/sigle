import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

const editorPostSchema = z.object({
  title: z.string().min(4).max(150),
});

export type EditorPostFormData = z.infer<typeof editorPostSchema>;

interface EditorFormProviderProps {
  children: React.ReactNode;
}

export const EditorFormProvider = ({ children }: EditorFormProviderProps) => {
  const methods = useForm<EditorPostFormData>({
    resolver: zodResolver(editorPostSchema),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
