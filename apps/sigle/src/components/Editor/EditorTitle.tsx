import { Text } from "@radix-ui/themes";
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
          className="w-full border-none bg-transparent text-6 font-bold outline-none"
          placeholder="Title"
          {...register("title")}
        />
      </div>
      {errors.title && (
        <Text as="p" size="2" color="red">
          {errors.title.message}
        </Text>
      )}
    </div>
  );
};
