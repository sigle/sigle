import { IconRocket } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";

export const EditorPublish = () => {
  const { watch } = useFormContext<EditorPostFormData>();
  const type = watch("type");
  const setPublishOpen = useEditorStore((state) => state.setPublishOpen);

  if (type === "published") {
    return (
      <Button variant="ghost" onClick={() => setPublishOpen(true)}>
        Update
      </Button>
    );
  }

  return (
    <Button variant="ghost" onClick={() => setPublishOpen(true)}>
      Publish
      <IconRocket size={16} />
    </Button>
  );
};
