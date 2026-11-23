import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";

export const EditorPublish = () => {
  const { watch } = useFormContext<EditorPostFormData>();
  const type = watch("type");
  const setPublishOpen = useEditorStore((state) => state.setPublishOpen);

  return (
    <Button size="sm" onClick={() => setPublishOpen(true)}>
      {type === "published" ? "Update" : "Publish"}
    </Button>
  );
};
