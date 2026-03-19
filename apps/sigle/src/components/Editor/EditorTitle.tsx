import { useFormContext, useFormState } from "react-hook-form";
import type { EditorPostFormData } from "./EditorFormProvider";

export const EditorTitle = () => {
  const { register } = useFormContext<EditorPostFormData>();
  const { errors } = useFormState<EditorPostFormData>({
    name: "title",
  });

  return (
    <div className="mt-4 space-y-2">
      <div>
        <input
          className="w-full border-none bg-transparent text-2xl font-bold outline-none"
          placeholder="Title"
          {...register("title")}
        />
      </div>
      {errors.title && (
        <p className="text-sm text-destructive">{errors.title.message}</p>
      )}
    </div>
  );
};
