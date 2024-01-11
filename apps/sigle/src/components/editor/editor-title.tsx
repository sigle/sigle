import { useFormContext, useFormState } from 'react-hook-form';
import { Text } from '@radix-ui/themes';
import { EditorPostFormData } from './editor-form-provider';

export const EditorTitle = () => {
  const { register } = useFormContext<EditorPostFormData>();
  const { errors } = useFormState<EditorPostFormData>({
    name: 'title',
  });

  return (
    <div className="space-y-1">
      <input
        className="w-full border-none text-8 font-bold outline-none"
        placeholder="Title"
        {...register('title')}
      />
      {errors.title && (
        <Text as="p" size="2" color="red">
          {errors.title.message}
        </Text>
      )}
    </div>
  );
};
