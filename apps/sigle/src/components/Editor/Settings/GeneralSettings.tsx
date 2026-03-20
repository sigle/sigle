import { IconX } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { WithContext as ReactTags, type Tag } from "react-tag-input";
import { cn } from "@/lib/cn";
import type { EditorPostFormData } from "../EditorFormProvider";

export const GeneralSettings = () => {
  const { setValue, watch } = useFormContext<EditorPostFormData>();
  const tags = watch("tags") || [];

  const handleDelete = (index: number) => {
    setValue(
      "tags",
      tags?.filter((_, i) => i !== index),
    );
  };

  const handleTagUpdate = (index: number, newTag: Tag) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1, newTag.id);
    setValue("tags", updatedTags);
  };

  const handleAddition = (tag: Tag) => {
    setValue("tags", [...tags, tag.id]);
  };

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
    const newTags = tags.slice();
    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag.id);
    // re-render
    setValue("tags", newTags);
  };

  const handleClearAll = () => {
    setValue("tags", []);
  };

  const formattedTags = tags.map((tag) => ({
    id: tag,
    text: tag,
    className: "",
  }));

  return (
    <div className="border-b border-border p-4">
      <p className="mb-2 font-medium">Tags (max 5)</p>
      <ReactTags
        autoFocus={false}
        classNames={{
          tags: "text-2",
          tagInput: "flex gap-2",
          clearAll: "whitespace-nowrap",
          tagInputField:
            "h-8 rounded-md border border-border pl-3.5 w-full focus:outline-accent",
          selected: "mt-2 flex gap-2 flex-wrap",
          tag: cn(
            "inline-flex h-5 gap-1 rounded-4xl border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-secondary-foreground transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none [a]:hover:bg-secondary/80",
          ),
        }}
        tags={formattedTags}
        inputFieldPosition="top"
        handleDelete={handleDelete}
        handleAddition={handleAddition}
        handleDrag={handleDrag}
        onTagUpdate={handleTagUpdate}
        onClearAll={handleClearAll}
        maxTags={5}
        removeComponent={({ onRemove }) => (
          <button type="button" onClick={onRemove} className="text-primary">
            <IconX size={14} />
          </button>
        )}
      />
    </div>
  );
};
