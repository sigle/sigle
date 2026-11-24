import { useFormContext } from "react-hook-form";
import { CONTENT_WARNINGS } from "@/lib/content-warning";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";

const ReviewRow = ({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: { label: string; onClick: () => void };
}) => (
  <div className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm">
    <span className="text-muted-foreground">{label}</span>
    {action ? (
      <button
        type="button"
        onClick={action.onClick}
        className="underline underline-offset-4 hover:text-muted-foreground"
      >
        {action.label}
      </button>
    ) : (
      <span className="truncate">{value}</span>
    )}
  </div>
);

export const PublishReviewGeneral = () => {
  const { getValues } = useFormContext<EditorPostFormData>();
  const setMenuOpen = useEditorStore((state) => state.setMenuOpen);
  const setPublishOpen = useEditorStore((state) => state.setPublishOpen);
  const data = getValues();

  const isMetaConfigured = data.metaTitle && data.metaDescription;
  const tags = data.tags ?? [];

  const openSettings = (menu: true | "meta") => {
    setPublishOpen(false);
    setMenuOpen(menu);
  };

  return (
    <div className="border-t border-border">
      <ReviewRow
        label="Search and social preview"
        value="Set"
        action={
          isMetaConfigured
            ? undefined
            : { label: "Add", onClick: () => openSettings("meta") }
        }
      />
      <ReviewRow
        label="Cover image"
        value={data.coverImage ? "Added" : "None"}
      />
      <ReviewRow
        label="Tags"
        value={tags.join(", ")}
        action={
          tags.length > 0
            ? undefined
            : { label: "Add", onClick: () => openSettings(true) }
        }
      />
      <ReviewRow
        label="Content warning"
        value={
          data.contentWarning
            ? CONTENT_WARNINGS[data.contentWarning].label
            : "None"
        }
      />
    </div>
  );
};
