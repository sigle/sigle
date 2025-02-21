import { Button } from "@radix-ui/themes";
import { IconRocket } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";

export const EditorPublish = () => {
  const { watch } = useFormContext<EditorPostFormData>();
  const type = watch("type");
  const setPublishOpen = useEditorStore((state) => state.setPublishOpen);

  if (type === "published") {
    return (
      <Button size="2" variant="ghost" onClick={() => setPublishOpen(true)}>
        Update
      </Button>
    );
  }

  return (
    <Button size="2" variant="ghost" onClick={() => setPublishOpen(true)}>
      Publish
      <IconRocket size={16} />
    </Button>
  );
};
