import { Inset, Text } from "@radix-ui/themes";
import { IconX } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { WithContext as ReactTags, type Tag } from "react-tag-input";
import { EditorPostFormData } from "../EditorFormProvider";

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
    <Inset side="x">
      <div className="border-b border-gray-5 px-6 py-4">
        <Text as="p" size="2" mb="1">
          Tags (max 5)
        </Text>
        <ReactTags
          classNames={{
            tags: "text-2",
            tagInput: "flex gap-2",
            clearAll: "whitespace-nowrap",
            tagInputField:
              "h-8 rounded-2 border border-gray-4 pl-3.5 w-full focus:outline-orange-8",
            selected: "mt-2 flex gap-2 flex-wrap",
            tag: "inline-flex gap-1 rounded-2 border px-1.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-orange-3 text-orange-9 shadow hover:bg-orange-3",
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
            <button
              type="button"
              onClick={() => onRemove()}
              className="text-orange-9"
            >
              <IconX size={14} />
            </button>
          )}
        />
      </div>
    </Inset>
  );
};
