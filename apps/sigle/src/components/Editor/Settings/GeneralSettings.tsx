import type { Tag } from "react-tag-input";
import { IconX } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { WithContext as ReactTags } from "react-tag-input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTENT_WARNINGS } from "@/lib/content-warning";
import type { EditorPostFormData } from "../EditorFormProvider";

const contentWarningItems = [
  { value: null, label: "None" },
  ...(["sensitive", "nsfw", "spoiler"] as const).map((value) => ({
    value,
    label: CONTENT_WARNINGS[value].label,
  })),
];

const ContentWarningSetting = () => {
  const { setValue, watch } = useFormContext<EditorPostFormData>();
  const contentWarning = watch("contentWarning");

  return (
    <div className="border-b border-border py-4">
      <p className="text-sm font-medium">Content warning</p>
      <p className="mt-1 mb-3 text-sm text-muted-foreground">
        {contentWarning
          ? CONTENT_WARNINGS[contentWarning].description
          : "Readers see a warning before your post."}
      </p>
      <Select
        items={contentWarningItems}
        value={contentWarning ?? null}
        onValueChange={(value) =>
          setValue("contentWarning", value ?? undefined)
        }
      >
        <SelectTrigger aria-label="Content warning" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {contentWarningItems.map((item) => (
              <SelectItem key={item.label} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

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
    <>
      <div className="border-b border-border py-4">
        <p className="text-sm font-medium">Tags</p>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">
          Up to 5, shown above the title of your post.
        </p>
        <ReactTags
          autoFocus={false}
          classNames={{
            tags: "text-sm",
            tagInput: "flex gap-2",
            clearAll:
              "whitespace-nowrap text-xs text-muted-foreground hover:text-foreground",
            tagInputField:
              "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            selected: "mt-3 flex flex-wrap gap-2",
            tag: "inline-flex h-6 items-center gap-1 rounded-md border border-border px-2 font-mono text-xs whitespace-nowrap",
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
              onClick={onRemove}
              aria-label="Remove tag"
              className="text-muted-foreground hover:text-foreground"
            >
              <IconX size={12} />
            </button>
          )}
        />
      </div>

      <ContentWarningSetting />
    </>
  );
};
