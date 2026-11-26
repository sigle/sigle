import { useFormContext } from "react-hook-form";
import { env } from "@/env";
import { resolveImageUrl } from "@/lib/images";
import { prettifyUrl } from "@/lib/urls";
import type { EditorPostFormData } from "../EditorFormProvider";
import { useEditorStore } from "../store";

export const SeoPreview = () => {
  const editor = useEditorStore((state) => state.editor);
  const { watch } = useFormContext<EditorPostFormData>();
  const watchTitle = watch("title");
  const watchMetaTitle = watch("metaTitle");
  const watchMetaDescription = watch("metaDescription");
  const watchCoverImage = watch("coverImage");

  const metaTitle = watchMetaTitle || watchTitle;

  const metaDescription =
    watchMetaDescription || editor?.getText().slice(0, 90);

  const metaImage = watchCoverImage;

  return (
    <div>
      <p className="text-sm font-medium">Link preview</p>
      <p className="mt-1 mb-3 text-sm text-muted-foreground">
        How the post looks when shared on social media.
      </p>
      <div className="overflow-hidden rounded-lg border border-border">
        {metaImage ? (
          // oxlint-disable-next-line nextjs/no-img-element -- an editor preview of the social card
          <img
            src={resolveImageUrl(metaImage)}
            alt="Cover social media preview"
            className="aspect-video w-full border-b border-border object-cover"
          />
        ) : null}
        <div className="space-y-0.5 p-3 text-sm">
          <p className="truncate font-mono text-xs text-muted-foreground">
            {prettifyUrl(env.NEXT_PUBLIC_APP_URL)}
          </p>
          <p className="truncate font-medium">{metaTitle}</p>
          <p className="line-clamp-2 text-muted-foreground">
            {metaDescription}
          </p>
        </div>
      </div>
    </div>
  );
};
