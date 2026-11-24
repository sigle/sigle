import { useFormContext, useFormState } from "react-hook-form";
import type { EditorPostFormData } from "./EditorFormProvider";

export const EditorTitle = () => {
  const { register } = useFormContext<EditorPostFormData>();

  const { errors } = useFormState<EditorPostFormData>({
    name: "title",
  });

  return (
    <div className="mt-12 space-y-2 md:mt-16">
      <div>
        <input
          className="w-full border-none bg-transparent headline text-4xl outline-none placeholder:text-muted-foreground/50 md:text-5xl"
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
